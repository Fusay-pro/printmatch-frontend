import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import { Upload, Printer, Check, X } from 'lucide-react'

const FILAMENTS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon', 'ASA', 'Other']

const POPULAR_PRINTERS = [
  'Bambu Lab X1C', 'Bambu Lab P1S', 'Bambu Lab A1',
  'Creality Ender 3', 'Creality K1', 'Creality CR-10',
  'Prusa MK4', 'Prusa Mini',
  'AnkerMake M5', 'Elegoo Saturn', 'Elegoo Mars',
  'Flashforge Adventurer',
]

const PRINTER_WATTAGE: Record<string, number> = {
  'Bambu Lab X1C': 1000, 'Bambu Lab P1S': 1000, 'Bambu Lab A1': 350,
  'Creality Ender 3': 270, 'Creality K1': 350, 'Creality CR-10': 350,
  'Prusa MK4': 360, 'Prusa Mini': 180,
  'AnkerMake M5': 350, 'Elegoo Saturn': 60, 'Elegoo Mars': 40,
  'Flashforge Adventurer': 200,
}

const PROVINCES = [
  'Bangkok', 'Chiang Mai', 'Chiang Rai', 'Nonthaburi', 'Pathum Thani',
  'Samut Prakan', 'Khon Kaen', 'Udon Thani', 'Nakhon Ratchasima', 'Phuket',
  'Songkhla', 'Surat Thani', 'Rayong', 'Chonburi', 'Ayutthaya',
  'Nakhon Si Thammarat', 'Ubon Ratchathani', 'Lampang', 'Phitsanulok', 'Other',
]

const STEPS = ['Setup', 'Location', 'Contact & ID']

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function BecomePartnerModal({ onClose, onSuccess }: Props) {
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0)

  const [bio, setBio] = useState('')
  const [printerInput, setPrinterInput] = useState('')
  const [selectedPrinters, setSelectedPrinters] = useState<string[]>([])
  const [selectedFilaments, setSelectedFilaments] = useState<string[]>([])
  const [printerWattage, setPrinterWattage] = useState('250')
  const [printerPhoto, setPrinterPhoto] = useState<string | null>(null)

  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')

  const [phone, setPhone] = useState('')
  const [lineId, setLineId] = useState('')
  const [idPhoto, setIdPhoto] = useState<string | null>(null)
  const [_idPhotoFile, setIdPhotoFile] = useState<File | null>(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleFilament = (f: string) =>
    setSelectedFilaments(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])

  const addPrinter = (name: string) => {
    const trimmed = name.trim()
    if (trimmed && !selectedPrinters.includes(trimmed)) {
      setSelectedPrinters(p => [...p, trimmed])
      if (PRINTER_WATTAGE[trimmed]) setPrinterWattage(String(PRINTER_WATTAGE[trimmed]))
    }
    setPrinterInput('')
  }

  const handlePrinterPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPrinterPhoto(URL.createObjectURL(file))
  }

  const handleIdPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setIdPhotoFile(file); setIdPhoto(URL.createObjectURL(file)) }
  }

  const validateStep = () => {
    setError('')
    if (step === 0) {
      if (!selectedPrinters.length) { setError('Add at least one printer'); return false }
      if (!selectedFilaments.length) { setError('Select at least one filament type'); return false }
      if (!printerPhoto) { setError('Upload a photo of your printer for verification'); return false }
    }
    if (step === 1) {
      if (!province) { setError('Select your province'); return false }
      if (!address.trim()) { setError('Enter your address'); return false }
    }
    if (step === 2) {
      if (!phone.trim()) { setError('Enter a contact phone number'); return false }
      if (!idPhoto) { setError('Upload your ID photo for identity verification'); return false }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return
    setLoading(true)
    try {
      await client.post('/api/printers', {
        bio,
        printers_owned: selectedPrinters,
        filaments: selectedFilaments,
        printer_wattage: Number(printerWattage) || 250,
        province,
        district,
        address,
        phone,
        line_id: lineId,
      })
      await refreshUser()
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--color-sidebar-bg)] rounded-lg shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <div>
            <h2 className="text-base font-semibold text-base">
              Become a Partner
            </h2>
            <p className="text-muted text-xs mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted hover:text-base transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-4">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-surface'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-danger text-sm px-4 py-3 rounded-md">{error}</div>
          )}

          {/* ── Step 1: Setup ── */}
          {step === 0 && (
            <>
              {/* Printers */}
              <div>
                <label className="block text-sm font-semibold text-base mb-1">
                  Which printer(s) do you own?
                </label>
                <p className="text-xs text-muted mb-3">Select from common models or type your own</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {POPULAR_PRINTERS.map(p => (
                    <button key={p} type="button" onClick={() => addPrinter(p)}
                      disabled={selectedPrinters.includes(p)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                        selectedPrinters.includes(p)
                          ? 'bg-accent/10 border-accent/30 text-accent cursor-default'
                          : 'border-hairline text-base/70 hover:border-accent hover:text-accent'
                      }`}>
                      {selectedPrinters.includes(p) && <Check className="inline w-3 h-3 mr-1" />}{p}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={printerInput} onChange={e => setPrinterInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPrinter(printerInput) } }}
                    placeholder="Other model..."
                    className="flex-1 border border-hairline rounded-md px-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition" />
                  <button type="button" onClick={() => addPrinter(printerInput)}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-accent hover:bg-accent-hover transition-colors">
                    Add
                  </button>
                </div>
                {selectedPrinters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedPrinters.map(p => (
                      <span key={p} className="flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
                        <Printer className="w-3 h-3" /> {p}
                        <button type="button" onClick={() => setSelectedPrinters(x => x.filter(v => v !== p))} className="hover:text-danger ml-1"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Filaments */}
              <div>
                <label className="block text-sm font-semibold text-base mb-1">
                  Filaments you support
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FILAMENTS.map(f => (
                    <button key={f} type="button" onClick={() => toggleFilament(f)}
                      className={`text-sm px-4 py-2 rounded-md border font-medium transition-colors ${
                        selectedFilaments.includes(f)
                          ? 'bg-accent border-accent text-white'
                          : 'border-hairline text-base/70 hover:border-accent hover:text-accent'
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wattage */}
              <div>
                <label className="block text-sm font-semibold text-base mb-1">
                  Printer wattage (W)
                </label>
                <p className="text-xs text-muted mb-2">Used to calculate electricity cost. Auto-filled from your selected model.</p>
                <input type="number" min="1" value={printerWattage} onChange={e => setPrinterWattage(e.target.value)}
                  className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition"
                  placeholder="e.g. 250" />
              </div>

              {/* Printer photo */}
              <div>
                <label className="block text-sm font-semibold text-base mb-1">
                  Photo of your printer
                </label>
                <p className="text-xs text-muted mb-3">Shows commissioners your actual setup</p>
                {printerPhoto ? (
                  <div className="relative rounded-lg overflow-hidden border border-hairline">
                    <img src={printerPhoto} alt="Printer" className="w-full h-36 object-cover" />
                    <button type="button" onClick={() => setPrinterPhoto(null)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1 rounded-full">Remove</button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-hairline rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors group">
                    <Printer className="w-6 h-6 mx-auto mb-1 text-muted group-hover:text-accent transition-colors" />
                    <p className="text-sm font-medium text-base/70 group-hover:text-accent">Upload printer photo</p>
                    <p className="text-xs text-muted mt-0.5">JPG or PNG</p>
                    <input type="file" accept="image/*" onChange={handlePrinterPhoto} className="hidden" />
                  </label>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  Bio <span className="text-muted font-normal text-xs">(optional)</span>
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                  className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition"
                  placeholder="Describe your experience and what you specialise in..." />
              </div>
            </>
          )}

          {/* ── Step 2: Location ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  Province
                </label>
                <select value={province} onChange={e => setProvince(e.target.value)}
                  className="w-full border border-hairline rounded-md px-4 py-3 text-sm text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition bg-[var(--color-sidebar-bg)]">
                  <option value="">Select province...</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  District / Area <span className="text-muted font-normal text-xs">(optional)</span>
                </label>
                <input value={district} onChange={e => setDistrict(e.target.value)}
                  className="w-full border border-hairline rounded-md px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition"
                  placeholder="e.g. Chatuchak" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  Address
                </label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  className="w-full border border-hairline rounded-md px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none placeholder:text-muted transition"
                  placeholder="Street address for pickup/delivery reference..." />
                <p className="text-xs text-muted mt-1.5">Used for local job matching — not shown publicly</p>
              </div>
            </>
          )}

          {/* ── Step 3: Contact & ID ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  Phone number
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full border border-hairline rounded-md px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition"
                  placeholder="e.g. 081-234-5678" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-base mb-1.5">
                  Line ID <span className="text-muted font-normal text-xs">(optional)</span>
                </label>
                <input value={lineId} onChange={e => setLineId(e.target.value)}
                  className="w-full border border-hairline rounded-md px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-muted transition"
                  placeholder="@yourlineid" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-base mb-1">
                  National ID / Passport
                </label>
                <p className="text-xs text-muted mb-3">
                  Required for identity verification. Kept private and only used for account approval.
                </p>
                {idPhoto ? (
                  <div className="relative rounded-lg overflow-hidden border border-hairline">
                    <img src={idPhoto} alt="ID" className="w-full h-36 object-cover" />
                    <button type="button" onClick={() => { setIdPhoto(null); setIdPhotoFile(null) }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1 rounded-full">Remove</button>
                    <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Pending review
                    </div>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-hairline rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors group">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-muted group-hover:text-accent transition-colors" />
                    <p className="text-sm font-medium text-base/70 group-hover:text-accent">Upload ID photo</p>
                    <p className="text-xs text-muted mt-0.5">Thai National ID or Passport · JPG or PNG</p>
                    <input type="file" accept="image/*" onChange={handleIdPhoto} className="hidden" />
                  </label>
                )}
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-1">
            {step > 0 && (
              <button type="button" onClick={() => { setError(''); setStep(s => s - 1) }}
                className="flex-1 py-3 rounded-md text-sm font-semibold border border-hairline text-base/70 hover:bg-surface transition-colors">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep}
                className="flex-1 py-3 rounded-md text-white text-sm font-semibold bg-accent hover:bg-accent-hover transition-colors">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-md text-white text-sm font-semibold bg-accent hover:bg-accent-hover disabled:opacity-60 transition-colors">
                {loading ? 'Submitting…' : 'Submit for Review'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
