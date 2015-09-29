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

#ifndef _ESP8266_MULTICAST_UDP
#define _ESP8266_MULTICAST_UDP

#include <ESP8266WiFi.h>
#include <WiFiUDP.h>

// Represents a received UDP data packet
struct DataPacket
{
	String data;
	IPAddress address;
	unsigned int port;
};

// Multicast verison for WiFiUDP
class ESP8266MulticastUDP
{
	public:
		ESP8266MulticastUDP(const String& ssid, const String& passcode,
			const IPAddress& address, unsigned int port);

		void begin();
		void join();

		bool isConnected();

		DataPacket read();
		void write(const String& information);

	protected:
		String ssid;
		String passcode;
		IPAddress address;
		unsigned int port;
		WiFiUDP udp;
		byte buffer[512];
};

#endif
