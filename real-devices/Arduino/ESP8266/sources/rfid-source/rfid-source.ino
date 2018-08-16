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

/*
 * Great tutorial (most of code copied from here): https://www.brainy-bits.com/card-reader-with-an-arduino-rfid-using-the-rc522-module/
 * Note that SDA pin in this site is actually NSS on our device
 * 
 * The MRFC522 library to be used can be found at: https://github.com/ljos/MFRC522
 * This one has been forked and updated from the MRFC522 library from the Library Manager!
 * 
 * IMPORTANT NOTES ABOUT THE SPI INTERFACE ON THE YISON NODEMCU 12E BOARD
 *  ST7735    ESP8266   NodeMCU 12E     RC522
 *  Reset     D0        GPIO16      
 *  CS        D1        GPIO5 +         NSS
 *  DC RS     D2        GPIO4 +         
 *  DIN SDI   HMOSI/D7  GPIO13          MOSI
 *  CLK       HCLK/D5   GPIO14          SCK
 *  VCC       Vin       Vin (4.5v)      VCC 3V3
 *  LED       3V3       V3V
 *  GND       GND       0in             GND
 *            HMISO/D6  GPIO12          MISO
 *            D0        GPIO16          RESET
 *
 *  
 */

#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <ESP8266MulticastUDP.h>
#include <SPI.h>
#include <MFRC522.h>

//The identifier for this node
const String& NODE_IDENTIFIER = "rfid-source";

//The interval (in milliseconds) at which input is read
#define READ_INTERVAL 1000

// Setup the ESP8266 Multicast UDP object as a source
ESP8266MulticastUDP multicast("iot-dataflow", "it-at-jcu",
  IPAddress(224, 0, 0, 114), 7070);


#define ERROR_PIN 15
#define NSSPIN D1
#define RESETPIN D0
#define MAX_LEN 5

byte FoundTag;
byte ReadTag;
byte TagData[MAX_LEN];
byte TagSerialNumber[5];
byte GoodTagSerialNumber[5] = {0x71, 0xB4, 0x21, 0x32};

MFRC522 nfc(NSSPIN, RESETPIN);

void setup()
{
  //Initialise serial communications
  SPI.begin();
  Serial.begin(115200);
  
  nfc.begin();
  byte version = nfc.getFirmwareVersion();
  if(!version){
    Serial.print("Didn't find RC522 board");
    while(1);
  }


  multicast.begin();
  Serial.print(NODE_IDENTIFIER);
  if (multicast.isConnected()) {
    Serial.println(" connected to Wifi network");
  } else {
    Serial.println(" error: failed to connect to WiFi network!");
    pinMode(ERROR_PIN, OUTPUT);
    digitalWrite(ERROR_PIN, HIGH);
  }
}


//Reads the current sensor input
// Note: a light sensor returns a value 0 (bright light) - 1023 (darkness)
// so we adjust the range to be 0 - 100
int readSource() {
  String GoodTag = "False";
  FoundTag = nfc.requestTag(MF1_REQIDL, TagData);

  if (FoundTag == MI_OK){
    delay(200);

    ReadTag = nfc.antiCollision(TagData);
    memcpy(TagSerialNumber, TagData, 4);
    Serial.println("Tag detected.");
    Serial.print("Serial Number: ");
    for (int i = 0; i < 4; i++){
      Serial.print(TagSerialNumber[i], HEX);
      Serial.print(", ");
    }
    Serial.println("");
    Serial.println();
  } else {
    return 0;
  }

  for(int i = 0; i < 4; i++){
    if(GoodTagSerialNumber[i] != TagSerialNumber[i]){
      break;
    }
    if (i == 3){
      GoodTag = "True";
    }
  }
  if (GoodTag == "True"){
    Serial.println("Success!");
    delay(100);
    return 1;
  } else {
    Serial.println("Tag not accepted :(");
    delay(50);
    return 0;
  }
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
