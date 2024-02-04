import modal

image_base = (
    modal.Image.debian_slim()
    .pip_install(
        "skyfield==1.47",
        "prisma==0.12.0",
        "pytz==2024.1",
    )
    .apt_install("curl")
    .run_commands(
        "curl https://raw.githubusercontent.com/sshh12/astro-app/main/prisma/schema.prisma?2 > /root/schema.prisma",
        "prisma generate --schema /root/schema.prisma",
        "python -c \"from skyfield.api import load; load('de421.bsp')\"",
    )
)
stub = modal.Stub("astro-app")
