/*
   IoT Dataflow Graph Server
   Copyright (c) 2015, Adam Rehn, Jason Holdsworth

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <ESP8266MulticastUDP.h>

//The identifier for this node
const String& NODE_IDENTIFIER = "fan-sink";

// The L9110 fan motor has a single 
unsigned int FAN_PIN_DIR = 12;
unsigned int FAN_PIN_SPEED = 13;

#define ERROR_PIN 15

typedef enum {
  WAITING, DELAY, ACTIVE
} State;

State state = WAITING;
State nextState = DELAY;
unsigned long start_time, current_time;
unsigned int amount;

// Setup the ESP8266 Multicast UDP object as a sink
ESP8266MulticastUDP multicast("iot-dataflow", "it-at-jcu",
  IPAddress(224, 0, 0, 115), 9090);


void setup()
{
  pinMode(FAN_PIN_DIR, OUTPUT);
  pinMode(FAN_PIN_SPEED, OUTPUT);
  digitalWrite(FAN_PIN_DIR, LOW);
  digitalWrite(FAN_PIN_SPEED, LOW);
  
  //Initialise serial communications
  Serial.begin(115200);

  //Attempt to connect to the WiFi network
  multicast.begin();
  Serial.print(NODE_IDENTIFIER);
  if (multicast.isConnected()) {
    multicast.join();
    Serial.println(" connected to WiFi and joined Multicast group");
  } else {
    Serial.println(" error: failed to connect to WiFi network!");
    pinMode(ERROR_PIN, OUTPUT);
    digitalWrite(ERROR_PIN, HIGH);
  }
}

void performTask(String data) {
  switch (state) {
    case WAITING:
      amount = data.toInt();
      if (amount == 0) {
        if (data.equals("true")) {
          state = DELAY;
          nextState = ACTIVE;
          amount = 127;
          start_time = millis();
        }
      } else {
        state = DELAY;
        nextState = ACTIVE;
        start_time = millis();
      }
    break;
    
    case DELAY:
      current_time = millis();
      if (start_time + 10 < current_time) { // delay(10)
        state = nextState;
        switch (nextState) {
          case WAITING:
            analogWrite(FAN_PIN_SPEED, 0); // stop
            break;
          case ACTIVE:
            digitalWrite(FAN_PIN_DIR, HIGH);
        }
      } 
    break;
    
    case ACTIVE:
      amount = data.toInt();
      if (amount == 0 || data.equals("false")) {
        digitalWrite(FAN_PIN_DIR, LOW);
        digitalWrite(FAN_PIN_SPEED, LOW);
        state = DELAY;
        nextState = WAITING;
      } else {
        amount = (int) (amount / 100.0 * 255);
        analogWrite(FAN_PIN_SPEED, 255 - amount);
      }
  }
}


void loop()
{

  if (multicast.isConnected())
  {
    DataPacket packet = multicast.read();
    String message = packet.data;

    if (message.startsWith(NODE_IDENTIFIER)) {
      performTask(message.substring(NODE_IDENTIFIER.length() + 1));
    }
  }
}
