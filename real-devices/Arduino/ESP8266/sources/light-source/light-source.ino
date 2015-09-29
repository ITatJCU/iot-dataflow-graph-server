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
#define NODE_IDENTIFIER String("ambient-source")

//The details of the WiFi access point
#define WIFI_AP_SSID String("iot-dataflow")
#define WIFI_AP_PASSCODE String("it-at-jcu")

//The multicast group details for a source
#define MULTICAST_ADDRESS IPAddress(224, 0, 0, 114)
#define MULTICAST_PORT 7070

//The interval (in milliseconds) at which input is read
#define READ_INTERVAL 100

// Setup the ESP8266 Multicast UDP object
ESP8266MulticastUDP multicast(WIFI_AP_SSID, WIFI_AP_PASSCODE,
  MULTICAST_ADDRESS, MULTICAST_PORT);


void setup()
{
  //Initialise serial communications
  Serial.begin(115200);

  multicast.begin();
  if (multicast.isConnected()) {
    Serial.println("Connected to Wifi network");
  } else {
    Serial.println("Error: failed to connect to WiFi network!");
  }
}


//Reads the current sensor input
// Note: ESP-12 dev board light sensor returns a value 0 (high) - 1023 (low)
int readSource() {
  int value = (int) ((1024 - analogRead(A0)) / 1024.0 * 100);
  return value;
}

void loop()
{
  if (multicast.isConnected())
  {
    String message = String(NODE_IDENTIFIER) + "\n" + readSource();
    multicast.write(message);
    delay(READ_INTERVAL);
  }
}
