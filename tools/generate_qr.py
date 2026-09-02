from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont


# ============================================================
# AI HOSPITAL ASSISTANT — QR CODE GENERATOR
# ============================================================

URL = "https://ai-hospital-frontend.onrender.com/"

# Output location
PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "frontend" / "public" / "qr"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

QR_FILE = OUTPUT_DIR / "ai-hospital-assistant-qr.png"
POSTER_FILE = OUTPUT_DIR / "ai-hospital-assistant-poster.png"


# ============================================================
# COLORS
# ============================================================

NAVY = "#123B66"
TEAL = "#0B8F9C"
LIGHT_BLUE = "#EAF7FB"
WHITE = "#FFFFFF"
DARK = "#17324D"
GREY = "#607080"


# ============================================================
# FONT HELPER
# ============================================================

def get_font(size: int, bold: bool = False):
    """
    Try common Windows fonts.
    Falls back to PIL's default font if unavailable.
    """

    possible_fonts = []

    if bold:
        possible_fonts = [
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\segoeuib.ttf",
        ]
    else:
        possible_fonts = [
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\segoeui.ttf",
        ]

    for font_path in possible_fonts:
        if Path(font_path).exists():
            return ImageFont.truetype(font_path, size)

    return ImageFont.load_default()


# ============================================================
# CREATE QR CODE
# ============================================================

def create_qr_code():

    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=18,
        border=4,
    )

    qr.add_data(URL)
    qr.make(fit=True)

    qr_image = qr.make_image(
        fill_color="#000000",
        back_color="#FFFFFF",
    ).convert("RGB")

    return qr_image


# ============================================================
# CREATE SIMPLE LOGO
# ============================================================

def create_logo(size=170):

    logo = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(logo)

    center = size // 2

    # Medical cross
    cross_width = int(size * 0.25)
    cross_length = int(size * 0.65)

    draw.rounded_rectangle(
        (
            center - cross_width // 2,
            center - cross_length // 2,
            center + cross_width // 2,
            center + cross_length // 2,
        ),
        radius=15,
        fill=TEAL,
    )

    draw.rounded_rectangle(
        (
            center - cross_length // 2,
            center - cross_width // 2,
            center + cross_length // 2,
            center + cross_width // 2,
        ),
        radius=15,
        fill=TEAL,
    )

    # Chat bubble
    bubble_left = int(size * 0.27)
    bubble_top = int(size * 0.38)
    bubble_right = int(size * 0.73)
    bubble_bottom = int(size * 0.68)

    draw.rounded_rectangle(
        (
            bubble_left,
            bubble_top,
            bubble_right,
            bubble_bottom,
        ),
        radius=25,
        fill=WHITE,
    )

    # Bubble tail
    draw.polygon(
        [
            (bubble_left + 30, bubble_bottom - 5),
            (bubble_left + 20, bubble_bottom + 25),
            (bubble_left + 55, bubble_bottom - 5),
        ],
        fill=WHITE,
    )

    # Chat dots
    dot_radius = 7
    dot_y = int(size * 0.525)

    for x in [
        int(size * 0.40),
        int(size * 0.50),
        int(size * 0.60),
    ]:
        draw.ellipse(
            (
                x - dot_radius,
                dot_y - dot_radius,
                x + dot_radius,
                dot_y + dot_radius,
            ),
            fill=TEAL,
        )

    return logo


# ============================================================
# ADD CENTER LOGO TO QR
# ============================================================

def add_logo_to_qr(qr_image):

    logo_size = max(100, qr_image.width // 5)

    logo = create_logo(logo_size)

    # White circular background
    padding = 16

    circle_size = logo_size + padding * 2

    center = Image.new(
        "RGBA",
        (circle_size, circle_size),
        (255, 255, 255, 0),
    )

    draw = ImageDraw.Draw(center)

    draw.ellipse(
        (
            0,
            0,
            circle_size - 1,
            circle_size - 1,
        ),
        fill=WHITE,
        outline=TEAL,
        width=5,
    )

    logo_position = (
        (circle_size - logo.width) // 2,
        (circle_size - logo.height) // 2,
    )

    center.alpha_composite(
        logo,
        logo_position,
    )

    # Put logo in QR center
    x = (qr_image.width - circle_size) // 2
    y = (qr_image.height - circle_size) // 2

    qr_image = qr_image.convert("RGBA")

    qr_image.alpha_composite(
        center,
        (x, y),
    )

    return qr_image.convert("RGB")


# ============================================================
# CREATE QR IMAGE
# ============================================================

def save_qr():

    print("Creating QR code...")

    qr = create_qr_code()

    qr = add_logo_to_qr(qr)

    qr.save(
        QR_FILE,
        "PNG",
        optimize=True,
    )

    print(f"QR code saved to:")
    print(QR_FILE)

    return qr


# ============================================================
# TEXT CENTERING
# ============================================================

def draw_centered_text(
    draw,
    text,
    y,
    font,
    fill,
    canvas_width,
):

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = bbox[2] - bbox[0]

    x = (canvas_width - text_width) // 2

    draw.text(
        (x, y),
        text,
        font=font,
        fill=fill,
    )


# ============================================================
# CREATE PROFESSIONAL POSTER
# ============================================================

def create_poster(qr):

    WIDTH = 1400
    HEIGHT = 1800

    poster = Image.new(
        "RGB",
        (WIDTH, HEIGHT),
        WHITE,
    )

    draw = ImageDraw.Draw(poster)

    # --------------------------------------------------------
    # Background
    # --------------------------------------------------------

    draw.rectangle(
        (0, 0, WIDTH, HEIGHT),
        fill=WHITE,
    )

    # Top light-blue area
    draw.rounded_rectangle(
        (40, 40, WIDTH - 40, 410),
        radius=45,
        fill=LIGHT_BLUE,
    )

    # Decorative medical circles
    for x, y, r in [
        (100, 110, 35),
        (1280, 120, 45),
        (120, 330, 25),
        (1280, 340, 30),
    ]:
        draw.ellipse(
            (x - r, y - r, x + r, y + r),
            outline=TEAL,
            width=5,
        )

    # --------------------------------------------------------
    # Logo
    # --------------------------------------------------------

    logo = create_logo(170)

    poster.alpha_composite if False else None

    logo_x = (WIDTH - logo.width) // 2
    logo_y = 65

    poster.paste(
        logo,
        (logo_x, logo_y),
        logo,
    )

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    title_font = get_font(72, bold=True)
    subtitle_font = get_font(42, bold=True)
    normal_font = get_font(34)

    draw_centered_text(
        draw,
        "AI HOSPITAL ASSISTANT",
        235,
        title_font,
        NAVY,
        WIDTH,
    )

    draw_centered_text(
        draw,
        "Your Health, Our Priority",
        325,
        subtitle_font,
        TEAL,
        WIDTH,
    )

    # --------------------------------------------------------
    # QR Card
    # --------------------------------------------------------

    card_left = 170
    card_top = 450
    card_right = WIDTH - 170
    card_bottom = 1320

    draw.rounded_rectangle(
        (
            card_left,
            card_top,
            card_right,
            card_bottom,
        ),
        radius=50,
        fill=WHITE,
        outline=TEAL,
        width=7,
    )

    # QR size
    qr_max = 720

    qr.thumbnail(
        (qr_max, qr_max),
        Image.Resampling.LANCZOS,
    )

    qr_x = (WIDTH - qr.width) // 2
    qr_y = 510

    poster.paste(
        qr,
        (qr_x, qr_y),
    )

    # --------------------------------------------------------
    # Scan message
    # --------------------------------------------------------

    banner_top = 1210
    banner_bottom = 1300

    draw.rounded_rectangle(
        (
            300,
            banner_top,
            WIDTH - 300,
            banner_bottom,
        ),
        radius=35,
        fill=NAVY,
    )

    banner_font = get_font(42, bold=True)

    draw_centered_text(
        draw,
        "SCAN TO START CONSULTATION",
        1227,
        banner_font,
        WHITE,
        WIDTH,
    )

    # --------------------------------------------------------
    # Features
    # --------------------------------------------------------

    feature_font = get_font(31, bold=True)
    feature_small = get_font(27)

    features = [
        ("Smart Consultation", "AI-guided patient information"),
        ("Health Guidance", "Get directed to the right department"),
        ("Appointment Support", "Simplify hospital visits"),
        ("Doctor Summary", "Patient information prepared for doctors"),
    ]

    y = 1380

    for title, description in features:

        # Small icon circle
        draw.ellipse(
            (150, y, 205, y + 55),
            fill=TEAL,
        )

        # Check mark
        check_font = get_font(30, bold=True)

        draw.text(
            (163, y + 8),
            "✓",
            font=check_font,
            fill=WHITE,
        )

        draw.text(
            (230, y - 2),
            title,
            font=feature_font,
            fill=NAVY,
        )

        draw.text(
            (230, y + 40),
            description,
            font=feature_small,
            fill=GREY,
        )

        y += 90

    # --------------------------------------------------------
    # URL
    # --------------------------------------------------------

    url_font = get_font(24)

    draw_centered_text(
        draw,
        URL,
        1740,
        url_font,
        TEAL,
        WIDTH,
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    poster.save(
        POSTER_FILE,
        "PNG",
        optimize=True,
    )

    print("Professional QR poster saved to:")
    print(POSTER_FILE)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AI HOSPITAL ASSISTANT")
    print("QR CODE GENERATOR")
    print("=" * 60)

    qr = save_qr()

    create_poster(qr)

    print()
    print("Done!")
    print()
    print("QR code:")
    print(QR_FILE)
    print()
    print("Poster:")
    print(POSTER_FILE)
    print()
    print("Test the QR code with your phone before printing.")