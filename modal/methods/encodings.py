from prisma import models

from methods.base import ASTRO_APP_BUCKET_PATH


def space_object_to_dict(obj: models.SpaceObject, show_content: bool = True) -> dict:
    props = {
        "id": str(obj.id),
    }
    if show_content:
        props.update(
            {
                "name": obj.name,
                "names": obj.names,
                "searchKey": obj.searchKey,
                "solarSystemKey": obj.solarSystemKey,
                "cometKey": obj.cometKey,
                "celestrakKey": obj.celestrakKey,
                "color": obj.color,
                "type": obj.type,
                "imgURL": obj.imgURL,
                "ra": float(obj.ra) if obj.ra else None,
                "dec": float(obj.dec) if obj.dec else None,
                "fluxV": float(obj.fluxV) if obj.fluxV else None,
                "sizeMajor": float(obj.sizeMajor) if obj.sizeMajor else None,
                "sizeMinor": float(obj.sizeMinor) if obj.sizeMinor else None,
                "sizeAngle": float(obj.sizeAngle) if obj.sizeAngle else None,
                "simbadName": obj.simbadName,
                "imgCredit": obj.imgCredit,
                "description": obj.description,
                "descriptionCredit": obj.descriptionCredit,
            }
        )
    return props


def list_to_dict(list: models.List, show_objects: bool = True) -> dict:
    list_dict = {
        "id": str(list.id),
        "title": list.title,
        "color": list.color,
        "credit": list.credit,
        "imgURL": list.imgURL,
        "type": list.type,
    }
    if list.objects:
        list_dict["objects"] = [
            space_object_to_dict(obj.SpaceObject, show_content=show_objects)
            for obj in list.objects
        ]
    return list_dict


def equipment_to_dict(equipment: models.Equipment) -> dict:
    float_keys = [
        "teleFocalLength",
        "teleAperture",
        "camPixelWidth",
        "camPixelHeight",
        "barlow",
        "eyeFocalLength",
        "eyeFOV",
        "binoAperture",
        "binoMagnification",
        "binoActualFOV",
    ]
    int_keys = ["camWidth", "camHeight", "binning"]
    str_keys = ["teleName", "camName", "eyeName", "binoName"]
    eq_dict = {
        "id": str(equipment.id),
        "active": equipment.active,
        "type": equipment.type,
    }
    for key in float_keys:
        eq_dict[key] = (
            float(getattr(equipment, key))
            if getattr(equipment, key) is not None
            else None
        )
    for key in str_keys + int_keys:
        eq_dict[key] = getattr(equipment, key)
    return eq_dict


def location_to_dict(location: models.Location) -> dict:
    return {
        "id": str(location.id),
        "name": location.name,
        "active": location.active,
        "timezone": location.timezone,
        "lat": float(location.lat),
        "lon": float(location.lon),
        "elevation": float(location.elevation),
    }


def image_to_dict(user: models.User, image: models.Image) -> dict:
    solve_dict = {}
    if image.ra:
        solve_dict = {
            "ra": float(image.ra),
            "dec": float(image.dec),
            "widthArcSec": float(image.widthArcSec),
            "heightArcSec": float(image.heightArcSec),
            "radius": float(image.radius),
            "pixelScale": float(image.pixelScale),
            "orientation": float(image.orientation),
            "parity": float(image.parity),
        }
    if image.objsInField:
        solve_dict["objsInField"] = image.objsInField.split("|")
    if image.mappedObjs:
        solve_dict["mappedObjs"] = image.mappedObjs
    return {
        "id": str(image.id),
        "title": image.title,
        "mainImageId": image.mainImageId,
        "mainImageUrl": f"{ASTRO_APP_BUCKET_PATH}user_images/{user.id}/{image.mainImageId}.jpg",
        "astrometrySid": image.astrometrySid,
        "astrometryStatus": image.astrometryStatus,
        "astrometryJobId": image.astrometryJobId,
        "astrometryJobCalibrationsId": image.astrometryJobCalibrationsId,
        "widthPx": image.widthPx,
        "heightPx": image.heightPx,
        **solve_dict,
    }


def user_to_dict(user: models.User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "lists": [list_to_dict(list.List) for list in user.lists],
        "equipment": [equipment_to_dict(equip) for equip in user.equipment],
        "location": [location_to_dict(loc) for loc in user.location],
        "images": [image_to_dict(user, image) for image in user.images],
    }
