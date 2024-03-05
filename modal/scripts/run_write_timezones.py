from typing import List, Dict
import datetime as dt
import pytz
import json


def get_timezones() -> List[Dict]:
    timezones = pytz.common_timezones
    return [
        {
            "name": tz,
            "offset": dt.datetime.now(pytz.timezone(tz)).strftime("%z"),
        }
        for tz in timezones
    ]


if __name__ == "__main__":
    with open("../app/timezones.js", "w") as f:
        json_ = json.dumps(get_timezones(), indent=2)
        f.write("export const TIMEZONES = " + json_ + ";")
