input.onButtonPressed(Button.A, function () {
    bluetooth.uartWriteLine("wakeup")
    measure()
    power.lowPowerRequest()
})
input.onButtonPressed(Button.B, function () {
    bluetooth.uartWriteLine("baseline")
    // address: 0x58
    // measure: 0x2015
    pins.i2cWriteNumber(
    88,
    8213,
    NumberFormat.UInt16BE,
    false
    )
    basic.pause(12)
    CO2 = pins.i2cReadNumber(88, NumberFormat.Int16BE, true)
    bluetooth.uartWriteValue("b0", CO2)
    crc = pins.i2cReadNumber(88, NumberFormat.Int8BE, true)
    bluetooth.uartWriteValue("crc", crc)
    TVOC = pins.i2cReadNumber(88, NumberFormat.Int16BE, true)
    bluetooth.uartWriteValue("b1", TVOC)
    crc = pins.i2cReadNumber(88, NumberFormat.Int8BE, true)
    bluetooth.uartWriteValue("crc", crc)
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
function measure () {
    temp = Math.round(AHT20.aht20ReadTemperatureC())
    humi = Math.round(AHT20.aht20ReadHumidity())
    v_solar = pins.analogReadPin(AnalogPin.P1)
    v_cap = pins.analogReadPin(AnalogPin.P2)
    SGP30_Read()
    bluetooth.uartWriteValue("temp", temp)
    bluetooth.uartWriteValue("humi", humi)
    bluetooth.uartWriteValue("co2", CO2)
    bluetooth.uartWriteValue("vol", v_cap)
    bluetooth.uartWriteLine("done")
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
}
function SGP30_Reset () {
    pins.i2cWriteNumber(
    0,
    6,
    NumberFormat.UInt8BE,
    false
    )
    basic.pause(100)
}
let v_cap = 0
let v_solar = 0
let humi = 0
let temp = 0
let TVOC = 0
let crc = 0
let CO2 = 0
bluetooth.startUartService()
SGP30_Reset()
SGP30_Init()
SGP30_Read()
for (let index = 0; index < 15; index++) {
    SGP30_Read()
    bluetooth.uartWriteValue("init", CO2)
    basic.pause(1000)
}
while (CO2 == 400) {
    SGP30_Read()
    bluetooth.uartWriteValue("init", CO2)
    basic.pause(1000)
}
let interval = 300000
power.fullPowerOn(FullPowerSource.A)
power.lowPowerRequest()
power.fullPowerEvery(interval, function () {
    measure()
    if (v_cap < v_solar) {
        //    300000 ms
        // = 300 seconds
        // = 5 minutes
        interval = 300000
    } else {
        //    1800000 ms
        // = 1800 seconds
        // = 30 minutes
        interval = 1800000
    }
    power.lowPowerRequest()
})
