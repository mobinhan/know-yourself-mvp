from datetime import timezone
from ephemeris import calculate_chart, julian_day, longitude, design_jd, _sun_delta, swe

def test_design_sun_is_88_degrees_behind_birth_sun():
    result = calculate_chart("1982-04-15T07:38:00", "Europe/Amsterdam")
    birth_jd = julian_day(__import__("ephemeris").local_to_utc("1982-04-15T07:38:00", "Europe/Amsterdam"))
    design = design_jd(birth_jd)
    birth_sun = longitude(birth_jd, swe.SUN)
    delta = _sun_delta(design, birth_sun)
    assert abs(delta + 88.0) < 1e-8

def test_design_timestamp_precedes_birth():
    from ephemeris import local_to_utc
    birth_jd = julian_day(local_to_utc("1982-04-15T07:38:00", "Europe/Amsterdam"))
    assert design_jd(birth_jd) < birth_jd

def test_design_search_is_stable_across_multiple_charts():
    cases = [
        ("1990-06-21T12:00:00", "Europe/Amsterdam"),
        ("1975-12-03T08:15:00", "America/New_York"),
        ("2001-03-28T18:40:00", "Asia/Singapore"),
        ("2012-09-17T23:55:00", "Australia/Sydney"),
    ]
    from ephemeris import local_to_utc
    for local_dt, tz in cases:
        birth_jd = julian_day(local_to_utc(local_dt, tz))
        design = design_jd(birth_jd)
        birth_sun = longitude(birth_jd, swe.SUN)
        assert abs(_sun_delta(design, birth_sun) + 88.0) < 1e-8
        assert design < birth_jd
