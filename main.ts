bluetooth.onBluetoothConnected(function () {
    paired = 1
})
function SGP30_Init () {
    // address: 0x58
    // init_cmd: 0x2003
    pins.i2cWriteNumber(
    88,
    8195,
    NumberFormat.UInt16BE,
    false
    )
    basic.pause(100)
}
function I2C_Reset () {
    pins.i2cWriteNumber(
    0,
    6,
    NumberFormat.UInt8BE,
    false
    )
    basic.pause(100)
}
function SGP30_Read () {
    // address: 0x58
    // measure: 0x2008
    pins.i2cWriteNumber(
    88,
    8200,
    NumberFormat.UInt16BE,
    false
    )
    basic.pause(10)
    CO2 = pins.i2cReadNumber(88, NumberFormat.UInt16BE, false)
    crc = pins.i2cReadNumber(88, NumberFormat.UInt8BE, false)
    TVOC = pins.i2cReadNumber(88, NumberFormat.UInt16BE, false)
    crc = pins.i2cReadNumber(88, NumberFormat.UInt8BE, false)
}
let v_cap = 0
let v_solar = 0
let humi = 0
let temp = 0
let TVOC = 0
let crc = 0
let CO2 = 0
let paired = 0
let interval = 600000
paired = 0
bluetooth.startUartService()
power.fullPowerEvery(interval, function () {
    I2C_Reset()
    SGP30_Init()
    SGP30_Read()
    while (CO2 == 400) {
        bluetooth.uartWriteValue("init", CO2)
        basic.pause(1000)
        SGP30_Read()
    }
    temp = Math.round(AHT20.aht20ReadTemperatureC())
    humi = Math.round(AHT20.aht20ReadHumidity())
    v_solar = pins.analogReadPin(AnalogPin.P1)
    v_cap = pins.analogReadPin(AnalogPin.P2)
    bluetooth.uartWriteValue("temp", temp)
    bluetooth.uartWriteValue("humi", humi)
    bluetooth.uartWriteValue("co2", CO2)
    bluetooth.uartWriteValue("vol", v_cap)
    bluetooth.uartWriteValue("sol", v_solar)
    bluetooth.uartWriteLine("done")
    if (paired == 1) {
        I2C_Reset()
        power.lowPowerRequest()
    }
})
