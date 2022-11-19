def on_bluetooth_connected():
    global paired
    SGP30_Init()
    paired = 1
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def i2c_reset():
    pins.i2c_write_number(0, 6, NumberFormat.UINT8_BE, False)
def SGP30_Init():
    # address: 0x58
    # init_cmd: 0x2003
    pins.i2c_write_number(88, 8195, NumberFormat.UINT16_BE, False)
def SGP30_Read():
    global CO2, crc, TVOC
    # address: 0x58
    # measure: 0x2008
    pins.i2c_write_number(88, 8200, NumberFormat.UINT16_BE, False)
    basic.pause(10)
    CO2 = pins.i2c_read_number(88, NumberFormat.UINT16_BE, False)
    crc = pins.i2c_read_number(88, NumberFormat.UINT8_BE, False)
    TVOC = pins.i2c_read_number(88, NumberFormat.UINT16_BE, False)
    crc = pins.i2c_read_number(88, NumberFormat.UINT8_BE, False)
TVOC = 0
crc = 0
CO2 = 0
paired = 0
pins.set_audio_pin_enabled(False)
led.enable(False)
paired = 0
bluetooth.start_uart_service()
i2c_reset()

def on_full_power_every():
    if paired == 1:
        SGP30_Read()
        bluetooth.uart_write_value("co2", CO2)
        bluetooth.uart_write_value("tvoc", TVOC)
        bluetooth.uart_write_value("a2", pins.analog_read_pin(AnalogPin.P3))
        power.low_power_request()
power.full_power_every(10000, on_full_power_every)
