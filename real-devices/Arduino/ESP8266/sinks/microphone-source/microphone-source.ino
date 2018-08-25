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
//#include <Timer.h>

//The identifier for this node
const String& NODE_IDENTIFIER = "microphone-source";

//The interval (in milliseconds) at which input is read
#define ARRAY_SIZE 10

int minValue;
int maxValue;
bool hasData;

unsigned long prevTime;

// Setup the ESP8266 Multicast UDP object as a source
ESP8266MulticastUDP multicast("iot-dataflow", "it-at-jcu",
  IPAddress(224, 0, 0, 114), 7070);


#define ERROR_PIN 15
#define READ_INTERVAL 50

void resetReadings(){
  hasData = false;
  prevTime = millis();
}

void setup()
{
  //Initialise serial communications
  Serial.begin(115200);

  multicast.begin();
  Serial.print(NODE_IDENTIFIER);
  if (multicast.isConnected()) {
    Serial.println(" connected to Wifi network");
  } else {
    Serial.println(" error: failed to connect to WiFi network!");
    pinMode(ERROR_PIN, OUTPUT);
    digitalWrite(ERROR_PIN, HIGH);
  }

  // Pin 13 acts as Vcc
  // Pin 12 acts as GND
  //  in the absence of more power pins
  pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  digitalWrite(12, LOW);
  digitalWrite(13, HIGH);

  resetReadings();
}

int readSource() {
  // Send the maximum value measured since the last sent message.
  int scaledMax = (int)((double) maxValue / 1023.0 * 100.0);
  // Flush collected data
  resetReadings();
  return scaledMax;
}

void takeReading(){
  // Read from the ADC and test if the value is outside the current max/min range.
  int rawValue = analogRead(A0);
  if(!hasData){
    maxValue = minValue = rawValue;
    hasData = true;
  } else {
    maxValue = max(maxValue, rawValue);
    minValue = min(minValue, rawValue);
  }
}

void sendUpdate(){
  // Send the update
  if (multicast.isConnected())
  {
    String message = String(NODE_IDENTIFIER) + "\n" + readSource();
    multicast.write(message);
  }
}

void loop()
{
  static bool on = false;
  takeReading();
  delay(1);
  Serial.println(millis() - prevTime);
  if((millis() - prevTime) > READ_INTERVAL) {
    sendUpdate();
    digitalWrite(ERROR_PIN, on ? HIGH : LOW);
    on = !on;
  }
}
