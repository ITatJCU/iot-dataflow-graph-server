/*
   IoT Dataflow Graph Server
   Copyright (c) 2015, Adam Rehn, Jason Holdsworth
                 2018, Wilson Bow

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
const String& NODE_IDENTIFIER = "warning-sink";

// On the ESP8266 Full dev board, GPIO12 is a green LED
unsigned int RED_LED = 13;

#define ERROR_PIN 15


// Setup the ESP8266 Multicast UDP object as a sink
ESP8266MulticastUDP multicast("iot-dataflow", "it-at-jcu", IPAddress(224, 0, 0, 115), 9090);

void setup()
{
  pinMode(RED_LED, OUTPUT);

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
  int value = data.toInt(); // toInt() returns 0 on invalid format
  if (value > 0) {
    analogWrite(RED_LED, 100);
  } else if (data.equals("true")) {
    analogWrite(RED_LED, 100);
  } else {
    analogWrite(RED_LED, 0);
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
