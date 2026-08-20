# Chrome Silent Ticket Printing Guide (For Clients & Kiosk PCs)

Is guide ke zariye aap kisi bhi Client PC par bina kisi extra file ya software ke **Google Chrome** ko **Silent Auto-Printing Mode** par set kar sakte hain.

---

## 🛠️ Step-by-Step Client PC Setup (10 Seconds Setup)

### Step 1: Chrome Band Karein
Client PC par chalne wali tamam Chrome windows band kar dein.

### Step 2: Chrome Shortcut Properties Kholain
Desktop par mojood **Google Chrome Icon** par **Right-Click** karein aur **Properties** par click karein.

### Step 3: Target Field Edit Karein
1. **Shortcut** tab par jayein.
2. **Target** wali field ke bilkul aakhir mein **ek space** dein aur `--kiosk-printing` add kar dein.

**Pehle Aisa Hoga:**
```text
"C:\Program Files\Google\Chrome\Application\chrome.exe"
```

**Edit Karne Ke Baad Aisa Hoga:**
```text
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing
```

3. **Apply** aur **OK** click kar dein. *(Agar Administrator permission maange to Continue kar dein).*

---

## 🖨️ Step 4: Default Thermal Printer Set Karein

1. Windows **Start Menu** kholain aur search karein **Printers & Scanners**.
2. Apne **Thermal POS Printer** par click karein.
3. **"Set as default"** par click kar dein.

---

## ✅ Result
Ab client jab bhi apne Desktop waale Chrome icon se website (`https://qtech.techsolutionor.com`) kholega:
- Ticket generate hone par **koi Chrome Print Dialog / Preview window popup NAHI aayega**.
- Ticket **direct thermal printer** par print ho kar nikal aaye ga!
