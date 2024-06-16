import modal

image_base = (
    modal.Image.debian_slim()
    .pip_install(
        "skyfield==1.48",
        "prisma==0.12.0",
        "pytz==2024.1",
        "modal~=0.61.0",
        "pandas==2.2.1",
        "tqdm==4.66.2",
        "tzfpy==0.15.5",
        "geopy==2.4.1",
    )
    .apt_install("curl")
    .run_commands(
        "curl https://raw.githubusercontent.com/sshh12/astro-app/main/prisma/schema.prisma?60 > /root/schema.prisma",
        "prisma generate --schema /root/schema.prisma",
    )
)
stub = modal.Stub("astro-app")
