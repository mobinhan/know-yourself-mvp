from datetime import datetime, timezone
from ephemeris import local_to_utc, calculate_chart

def test_amsterdam_standard_time_conversion():
    assert local_to_utc("1982-01-15T07:38:00", "Europe/Amsterdam") == datetime(1982,1,15,6,38,tzinfo=timezone.utc)

def test_amsterdam_dst_conversion():
    assert local_to_utc("1982-07-15T07:38:00", "Europe/Amsterdam") == datetime(1982,7,15,5,38,tzinfo=timezone.utc)

def test_singapore_no_dst():
    assert local_to_utc("2001-03-28T18:40:00", "Asia/Singapore") == datetime(2001,3,28,10,40,tzinfo=timezone.utc)

def test_aware_input_is_respected():
    assert local_to_utc("1982-04-15T05:38:00+00:00", "Europe/Amsterdam") == datetime(1982,4,15,5,38,tzinfo=timezone.utc)

def test_calculation_reports_utc_conversion():
    result = calculate_chart("1982-04-15T07:38:00", "Europe/Amsterdam")
    assert result["birth_datetime_utc"] == "1982-04-15T05:38:00Z"
