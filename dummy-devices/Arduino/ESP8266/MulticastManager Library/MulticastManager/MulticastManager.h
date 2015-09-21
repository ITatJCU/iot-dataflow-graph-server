#ifndef _MULTICAST_MANAGER
#define _MULTICAST_MANAGER

#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <string.h>

//Represents a received UDP message
struct ReceivedMessage
{
	String message;
	IPAddress remoteAddr;
	unsigned int remotePort;
};

//Manages UDP multicast communications, and provides network utility functionality
class MulticastManager
{
	public:
		MulticastManager();
		
		//Attempts to join the specified WiFi network
		bool connectToNetwork(const char* ssid, const char* pass);
		
		//Determines if we are currently connected to a WiFi network
		bool isNetworkConnected();
		
		//Joins the specified multicast group
		void joinMulticastGroup(const IPAddress& addr, unsigned int port);
		
		//Blocks until a valid multicast packet arrives, and retrieves the details
		ReceivedMessage receive();
		
		//Attempts to send the specified message
		void send(const IPAddress& addr, unsigned int port, const char* message);
		
	protected:
		WiFiUDP udp;
		byte buffer[512];
};

#endif
