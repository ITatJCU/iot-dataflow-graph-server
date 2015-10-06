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
const String& NODE_IDENTIFIER = "buzzer-sink";

// We use GPIO 12 for the buzzer
unsigned int BUZZER_PIN = 12;

typedef enum {
  WAITING, START, PLAYING
} PlayState;

PlayState state = WAITING;
unsigned long play_start_time, current_time;
unsigned int amount;

// Setup the ESP8266 Multicast UDP object as a sink
ESP8266MulticastUDP multicast("iot-dataflow", "it-at-jcu",
  IPAddress(224, 0, 0, 115), 9090);


void setup()
{
  analogWrite(BUZZER_PIN, 0);
  
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
  }
}

void performTask(String data) {
  switch (state) {
    case WAITING:
//      Serial.println("waiting");
      amount = data.toInt();
      if (amount == 0) {
        if (data.equals("true")) {
          state = START;
          amount = 127;
        }
      } else {
        state = START;
      }  
    break;
    
    case START:
//      Serial.print("start, amount: ");
//      Serial.print(amount);
      analogWrite(BUZZER_PIN, amount);
      play_start_time = millis();
      state = PLAYING;
//      Serial.print(" play start time: ");
//      Serial.println(play_start_time);
    break;
    
    case PLAYING:
//      Serial.print("play start time: ");
//      Serial.print(play_start_time);
//      Serial.print(" amount: ");
//      Serial.print(amount);
      current_time = millis();
      if (play_start_time + amount < current_time) {
        analogWrite(BUZZER_PIN, 0);
        state = WAITING;
//        Serial.print(" stopping: ");
//      } else {
//        Serial.print(" playing: ");
      }
//      Serial.println(current_time);
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
