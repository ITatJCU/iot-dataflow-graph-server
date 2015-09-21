#include "MulticastManager.h"

MulticastManager::MulticastManager() {}

//Attempts to join the specified WiFi network
bool MulticastManager::connectToNetwork(const char* ssid, const char* pass)
{
	int tries = 0;
	const int maxTries = 30;
	
	WiFi.begin(ssid, pass);
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(500);
		tries++;
		
		//If we have exceeded the max number of connection attempts, report failure
		if (tries > maxTries){
			return false;
		}
	}
	
	return true;
}

//Determines if we are currently connected to a WiFi network
bool MulticastManager::isNetworkConnected() {
	return (WiFi.status() == WL_CONNECTED);
}

//Joins the specified multicast group
void MulticastManager::joinMulticastGroup(const IPAddress& addr, unsigned int port) {
	this->udp.beginMulticast(WiFi.localIP(), addr, port);
}

//Blocks until a valid multicast packet arrives, and retrieves the details
ReceivedMessage MulticastManager::receive()
{
	while (true)
	{
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
			
			//Build the message struct
			ReceivedMessage message;
			message.message    = String((const char*)this->buffer);
			message.remoteAddr = this->udp.remoteIP();
			message.remotePort = this->udp.remotePort();
			return message;
		}
	}
}

//Attempts to send the specified message
void MulticastManager::send(const IPAddress& addr, unsigned int port, const char* message)
{
	this->udp.beginPacketMulticast(addr, port, WiFi.localIP());
	this->udp.write(message);
	this->udp.endPacket();
}
