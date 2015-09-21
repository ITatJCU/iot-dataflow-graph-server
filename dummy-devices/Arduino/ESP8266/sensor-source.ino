/*
//  IoT Dataflow Graph Server
//  Copyright (c) 2015, Adam Rehn
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//  
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
*/
#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <MulticastManager.h>

//The identifier for this node
#define NODE_IDENTIFIER  "sensor-source"

//The details of the WiFi access point
#define WIFI_AP_SSID     "SSID"
#define WIFI_AP_PASS     "password"

//The multicast group we will send messages to
#define MULTICAST_ADDR   IPAddress(224, 0, 0, 114)
#define MULTICAST_PORT   7070

//The interval (in milliseconds) at which input is read
#define READ_INTERVAL    1000

//Reads the current sensor input
String readSource() {
	return String(analogRead(A0));
}

MulticastManager multicast;

void setup()
{
	//Initialise serial communications
	Serial.begin(115200);
	
	//Attempt to connect to the WiFi network
	if (multicast.connectToNetwork(WIFI_AP_SSID, WIFI_AP_PASS) == false) {
		Serial.println("Error: failed to connect to WiFi network!");
	}
}

void loop()
{
	if (multicast.isNetworkConnected())
	{
		String message = String(NODE_IDENTIFIER) + String("\n") + readSource();
		multicast.send(MULTICAST_ADDR, MULTICAST_PORT, message.c_str());
		delay(READ_INTERVAL);
	}
}
