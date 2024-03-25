from typing import List, Dict
import json
import requests
import re


def clean(text: str) -> str:
    return text.replace("&quot;", '"').replace("&amp;", "&")


def clean_float(v: str) -> float:
    val = float(v)
    if val.is_integer():
        val = int(val)
    return str(val)


def dedup_by_key(items: List[Dict], key: str) -> List[Dict]:
    seen = set()
    deduped = []
    for item in items:
        if item[key] not in seen:
            seen.add(item[key])
            deduped.append(item)
    return deduped


def extract_barlows(html: str) -> List[Dict]:
    text = re.search(r'id="fov_reducer_barlow">\s*([\s\S]+?)\s*<\/select>', html).group(
        1
    )
    barlows = []
    for m in re.findall(r'<option value="([\d\.]+)">([^<]+)<\/option>', text):
        barlows.append({"value": m[0], "name": m[1]})
    return barlows


def extract_eye_pieces(html: str) -> List[Dict]:
    text = re.search(
        r'id="fov_select_eyepiece">\s*([\s\S]+?)\s*<\/select>', html
    ).group(1)
    eye_pieces = []
    for m in re.findall(r'<option value="([^"]+)">([^<]+)<\/option>', text):
        parts = m[0].split("|")
        make, model, focal_length, apparent_fov, _ = parts
        eye_pieces.append(
            {
                "eyeName": clean(m[1]),
                "eyeMake": clean(make),
                "eyeModel": clean(model),
                "eyeFocalLength": clean_float(focal_length),
                "eyeFOV": clean_float(apparent_fov),
            }
        )
    eye_pieces = dedup_by_key(eye_pieces, "eyeName")
    return eye_pieces


def extract_telescopes(html: str) -> List[Dict]:
    text = re.search(
        r'id="fov_select_telescope">\s*([\s\S]+?)\s*<\/select>', html
    ).group(1)
    scopes = []
    for m in re.findall(r'<option value="([^"]+)">([^<]+)<\/option>', text):
        parts = m[0].split("|")
        make, model, focal_length, aperature, _ = parts
        scopes.append(
            {
                "teleName": clean(m[1]),
                "make": clean(make),
                "model": clean(model),
                "teleFocalLength": clean_float(focal_length),
                "teleAperture": clean_float(aperature),
            }
        )
    scopes = dedup_by_key(scopes, "teleName")
    return scopes


def extract_cameras(html: str) -> List[Dict]:
    text = re.search(r'id="fov_select_camera">\s*([\s\S]+?)\s*<\/select>', html).group(
        1
    )
    cams = []
    for m in re.findall(r'<option value="([^"]+)">([^<]+)<\/option>', text):
        parts = m[0].split("|")
        make, model, pix_width, pix_height, width, height, _ = parts
        cams.append(
            {
                "camName": clean(m[1]),
                "camMake": clean(make),
                "camModel": clean(model),
                "camPixelWidth": pix_width,
                "camPixelHeight": pix_height,
                "camWidth": str(int(float(width))),
                "camHeight": str(int(float(height))),
            }
        )
    cams = dedup_by_key(cams, "camName")
    return cams


def extract_binos(html: str) -> List[Dict]:
    text = re.search(
        r'id="fov_select_binocular">\s*([\s\S]+?)\s*<\/select>', html
    ).group(1)
    binos = []
    for m in re.findall(r'<option value="([^"]+)">([^<]+)<\/option>', text):
        parts = m[0].split("|")
        make, model, aperature, mag, fov, _ = parts
        binos.append(
            {
                "binoName": clean(m[1]),
                "binoMake": clean(make),
                "binoModel": clean(model),
                "binoAperture": clean_float(aperature),
                "binoMagnification": clean_float(mag),
                "binoActualFOV": clean_float(fov),
            }
        )
    binos = dedup_by_key(binos, "binoName")
    return binos


if __name__ == "__main__":
    html = requests.get("https://astronomy.tools/calculators/field_of_view/").text
    with open("../app/equipment.js", "w") as f:
        f.write(
            "export const BARLOWS = "
            + json.dumps(extract_barlows(html), indent=2)
            + ";\n\n"
        )
        f.write(
            "export const EYE_PIECES = "
            + json.dumps(extract_eye_pieces(html), indent=2)
            + ";\n\n"
        )
        f.write(
            "export const TELESCOPES = "
            + json.dumps(extract_telescopes(html), indent=2)
            + ";\n\n"
        )
        f.write(
            "export const CAMERAS = "
            + json.dumps(extract_cameras(html), indent=2)
            + ";\n\n"
        )
        f.write(
            "export const BINOS = "
            + json.dumps(extract_binos(html), indent=2)
            + ";\n\n"
        )
