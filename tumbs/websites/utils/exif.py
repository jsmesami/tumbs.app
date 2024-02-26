from PIL import ExifTags


def _dms_to_decimal(dms, ref):
    degrees, minutes, seconds = dms
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ("S", "W"):
        decimal = -decimal

    return decimal


def get_location(exif):
    ifd = exif.get_ifd(ExifTags.IFD.GPSInfo)
    location = [
        ifd.get(t)
        for t in (
            ExifTags.GPS.GPSLatitude,
            ExifTags.GPS.GPSLatitudeRef,
            ExifTags.GPS.GPSLongitude,
            ExifTags.GPS.GPSLongitudeRef,
        )
    ]
    if all(location):
        lat, lat_ref, lng, lng_ref = location
        return {
            "lat": _dms_to_decimal(lat, lat_ref),
            "lng": _dms_to_decimal(lng, lng_ref),
        }
    return None


def get_creation_time(exif):
    ifd = exif.get_ifd(ExifTags.IFD.Exif)
    basic, original, digitized = [
        ifd.get(t)
        for t in (
            ExifTags.Base.DateTime,
            ExifTags.Base.DateTimeOriginal,
            ExifTags.Base.DateTimeDigitized,
        )
    ]
    return basic or original or digitized
