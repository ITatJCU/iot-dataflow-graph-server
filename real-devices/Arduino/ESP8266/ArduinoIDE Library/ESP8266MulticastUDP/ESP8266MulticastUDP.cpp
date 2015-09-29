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

#include "ESP8266MulticastUDP.h"

//Attempts to join the given WiFi network
void joinWiFi(const String& ssid, const String& passcode)
{
	WiFi.begin(ssid.c_str(), passcode.c_str());

	int attempts = 0;
	const int maxAttempts = 500;
	while (WiFi.status() != WL_CONNECTED) {
		++attempts;

		if (attempts > maxAttempts){
			return;
		}
		yield(); // yield to ESP8266 background functions
		delay(100);
	}
	return;
}

ESP8266MulticastUDP::ESP8266MulticastUDP(const String& ssid,
	const String& passcode, const IPAddress& address, unsigned int port) {
		this->ssid = ssid;
		this->passcode = passcode;
		this->address = address;
		this->port = port;
	}

void ESP8266MulticastUDP::begin() {
		joinWiFi(ssid, passcode);
}

void ESP8266MulticastUDP::join() {
	this->udp.beginMulticast(WiFi.localIP(), address, port);
}

//Determines if we are currently connected to a WiFi network
bool ESP8266MulticastUDP::isConnected() {
	return (WiFi.status() == WL_CONNECTED);
}

//Blocks until a valid multicast packet arrives, and retrieves the details
DataPacket ESP8266MulticastUDP::read()
{
	while (true) {
		int bytesReceived = this->udp.parsePacket();
		if (bytesReceived > 0)
		{
			//Read the payload into our buffer
			memset(this->buffer, 0, sizeof(this->buffer));
			this->udp.read(this->buffer, bytesReceived);

			//Prevent buffer overflow
			if (bytesReceived >= sizeof(this->buffer)) {
				this->buffer[ sizeof(this->buffer) - 1 ] = 0;
			}

			//Build and return the data packet
			DataPacket packet;
			packet.data = String((const char*)this->buffer);
			packet.address = this->udp.remoteIP();
			packet.port = this->udp.remotePort();
			return packet;

		} else {
			yield(); // yield to ESP8266 background functions
		}
	}
}

//Attempts to send the specified message on the set multicast address and port
void ESP8266MulticastUDP::write(const String& information)
{
	this->udp.beginPacketMulticast(this->address, this->port, WiFi.localIP());
	this->udp.write(information.c_str());
	this->udp.endPacket();
}
