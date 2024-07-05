import modal

image_base = (
    modal.Image.debian_slim()
    .copy_local_dir("prisma", "/root/prisma")
    .pip_install(
        "skyfield==1.48",
        "prisma==0.12.0",
        "pytz==2024.1",
        "modal==0.63.31",
        "pandas==2.2.1",
        "tqdm==4.66.2",
        "tzfpy==0.15.5",
        "geopy==2.4.1",
        "aioboto3==13.1.0",
        "pillow==10.4.0",
    )
    .run_commands(
        "prisma generate --schema /root/prisma/schema.prisma",
    )
)
app = modal.App(
    "astro-app",
    secrets=[
        modal.Secret.from_name("astro-app-secret"),
        modal.Secret.from_name("default-aws-secret"),
    ],
)
