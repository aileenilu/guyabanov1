import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  Star,
  ShieldCheck,
  Droplets,
  Zap,
  Heart,
  Sparkles,
  CheckCircle2,
  Phone,
  ChevronDown,
  FlaskConical,
  Sun,
  Award,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function validatePHPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return /^(09\d{9}|(\+63)\d{10})$/.test(cleaned);
}

const benefits = [
  {
    icon: ShieldCheck,
    title: "Immune System Support",
    desc: "Supports immune system function sa tulong ng natural antioxidants at acetogenins",
    color: "from-forest-600 to-forest-800",
  },
  {
    icon: Leaf,
    title: "Gut Health Promotion",
    desc: "Promotes gut health gamit ang mga beneficial probiotics mula sa natural fermentation",
    color: "from-forest-500 to-forest-700",
  },
  {
    icon: Droplets,
    title: "Digestive Wellness",
    desc: "Aids sa digestive wellness at mas magandang nutrient absorption",
    color: "from-forest-600 to-forest-800",
  },
  {
    icon: FlaskConical,
    title: "Cellular Detox",
    desc: "Helps sa cellular detoxification at overall body cleansing",
    color: "from-forest-500 to-forest-700",
  },
  {
    icon: Zap,
    title: "Natural Energy Boost",
    desc: "Boosts natural energy at sumusuporta sa general vitality",
    color: "from-forest-600 to-forest-800",
  },
  {
    icon: Heart,
    title: "All-Natural Wellness Drink",
    desc: "Isang soothing, all-natural wellness beverage na walang synthetic ingredients",
    color: "from-forest-500 to-forest-700",
  },
  {
    icon: Sun,
    title: "Daily Health Elixir",
    desc: "Pwedeng i-enjoy daily o habang kumakain bilang isang health-enhancing elixir",
    color: "from-forest-600 to-forest-800",
  },
];

const testimonials = [
  {
    name: "Maria Santos",
    location: "Quezon City",
    rating: 5,
    text: "Grabe ang difference! Mula nang uminom ako ng Guyabano Wine, mas magaan ang pakiramdam ko. Mas maayos na ang tiyan ko at hindi na ako mabilis mapagod. Highly recommended!",
    avatar: "MS",
  },
  {
    name: "Ricardo Cruz",
    location: "Davao City",
    rating: 5,
    text: "Skeptical ako dati pero wow! After 2 weeks, mas malakas ang immune system ko. Hindi na ako mabilis magkasakit. Ang sarap pa niya, hindi parang gamot. Worth it talaga!",
    avatar: "RC",
  },
  {
    name: "Leonora Reyes",
    location: "Cebu City",
    rating: 5,
    text: "Bili na kayo! Sobrang ganda ng epekto sa katawan. Mas maayos na ang digestive system ko at mas masigla ako araw-araw. Natural pa, walang side effects!",
    avatar: "LR",
  },
  {
    name: "Jose Dela Cruz",
    location: "Cagayan de Oro",
    rating: 5,
    text: "Ito na ang pinaka-effective na health drink na natry ko. Ang laking tulong sa akin pagdating sa energy levels. Hindi ako bibili ng ibang brand. 100% natural — that's what matters!",
    avatar: "JD",
  },
  {
    name: "Ana Mendoza",
    location: "Marikina City",
    rating: 5,
    text: "Dalawa na order ko! Pinakamabisang wellness drink ever. Ang ganda ng epekto sa akin. Sobrang sulit ng presyo!",
    avatar: "AM",
  },
  {
    name: "Fernando Bautista",
    location: "Iloilo City",
    rating: 5,
    text: "Doc namin mismo nag-recommend nito. After a month, mas maayos na ang results ng blood test ko. Organic at natural talaga — makikita mo sa effect. Order na kayo!",
    avatar: "FB",
  },
];

const packages = [
  {
    id: "1_bottle",
    label: "1 Bottle",
    quantity: 1,
    price: 1550,
    perBottle: 1550,
    tag: null,
    highlight: false,
  },
  {
    id: "2_bottle",
    label: "2 Bottles",
    quantity: 2,
    price: 2998,
    perBottle: 1499,
    tag: "BEST VALUE",
    highlight: true,
  },
];

interface FormData {
  full_name: string;
  phone: string;
  address: string;
  package: string;
  notes: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  address?: string;
}

export default function App() {
  const [selectedPackage, setSelectedPackage] = useState("2_bottle");
  const [form, setForm] = useState<FormData>({
    full_name: "",
    phone: "",
    address: "",
    package: "2_bottle",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToOrder = () => {
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackage)!;

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.full_name.trim()) errs.full_name = "Pakiusap ilagay ang iyong pangalan.";
    if (!form.phone.trim()) {
      errs.phone = "Kinakailangan ang phone number.";
    } else if (!validatePHPhone(form.phone)) {
      errs.phone = "Mangyaring maglagay ng valid na Philippine phone number (e.g. 09XX XXX XXXX).";
    }
    if (!form.address.trim()) errs.address = "Kinakailangan ang delivery address.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const pkg = packages.find((p) => p.id === selectedPackage)!;
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        quantity: pkg.quantity,
        package: pkg.id,
        total_price: pkg.price,
        notes: form.notes.trim() || null,
      };

      const { error: dbError } = await supabase.from("leads").insert(payload);
      if (dbError) throw new Error(dbError.message);

      // Fire-and-forget email notification
      fetch(`${SUPABASE_URL}/functions/v1/notify-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError("May nangyaring error. Pakiulit muli o makipag-ugnayan sa amin.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(pkgId);
    setForm((prev) => ({ ...prev, package: pkgId }));
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-forest-950/95 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-gold-400" />
            <span className="font-serif font-bold text-white text-lg tracking-wide">
              Nature's Finest Doc Atoie's Guyabano
            </span>
          </div>
          <button
            onClick={scrollToOrder}
            className="btn-pulse bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold px-5 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105 shadow-md"
          >
            Order Now
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative hero-gradient min-h-screen flex items-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/40 rounded-full px-4 py-1.5 text-gold-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              100% Natural • Gawa sa Guyabano Fruit
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Nature's Finest
              <br />
              <span className="text-gold-gradient italic">Guyabano</span>
      
            </h1>

            <p className="text-forest-100 text-lg leading-relaxed max-w-lg text-justify">
              Tikman ang likas na sarap at benepisyo! Gawa mula sa{" "}
              <strong className="text-gold-300">100% natural na pagbuburo ng Guyabano</strong>{" "}
              (Annona muricata) — mayaman sa acetogenins, antioxidants, at natural probiotics.             
            </p>

<p className="text-forest-100 text-lg leading-relaxed max-w-lg text-justify">
   <strong className="text-gold-300">Nature’s Finest Guyabano Wine</strong>{" "}
              {" "} supports gut health, boosts immunity, at helps detox ang body. Crafted sa pamamagitan ng natural fermentation para ma-enhance ang absorption at ma-preserve ang nutrients, ito ay isang refreshing at functional daily tonic—walang artificial additives, pure fermented wellness lang sa bawat inom.{" "}
             
                     
            </p>
            <div className="flex flex-wrap gap-3">
              {["100% Natural", "Walang Preservatives", "Wellness Drink"].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-forest-100 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={scrollToOrder}
                className="btn-pulse animate-glow group relative bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
              >
                Order Ngayon
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#benefits"
                className="btn-pulse border-2 border-white/40 hover:border-gold-400 text-white hover:text-gold-300 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                Alamin Ang Benepisyo
                <ChevronDown className="w-5 h-5" />
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">500+</div>
                <div className="text-xs text-forest-200">Nasisiyahang Customers</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">4.9★</div>
                <div className="text-xs text-forest-200">Average Rating</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">100%</div>
                <div className="text-xs text-forest-200">Natural Ingredients</div>
              </div>
            </div>
          </div>

          {/* Right — product image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-3xl scale-75" />
              <img
                src="/c5615e2036fc8b44bc034095e62ae4d6_GUYABANO_WINE.png"
                alt="Nature's Finest Guyabano Wine"
                className="relative w-full max-w-sm lg:max-w-md object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section className="bg-forest-950 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Panoorin: Ang{" "}
            <span className="text-gold-gradient">Rekomendasyon ni Doc Atoie</span> 
          </h2>
          <p className="text-forest-200 text-lg">
            Alamin kung bakit ito ang pinaka-pinagkakatiwalaang wellness drink sa Pilipinas
          </p>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-forest-700">
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              controls
              playsInline
              poster="/c5615e2036fc8b44bc034095e62ae4d6_GUYABANO_WINE.png"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            >
              <source src="/winevid.mp4" type="video/mp4" />
            </video>
            {!videoPlaying && (
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/30 group"
                onClick={() => videoRef.current?.play()}
              >
                <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                  <div className="w-0 h-0 border-l-[28px] border-l-forest-950 border-t-[18px] border-t-transparent border-b-[18px] border-b-transparent ml-2" />
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="bg-gradient-to-b from-forest-950 to-forest-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="/w1.jpg"
                alt="Guyabano Wine - Nature's Finest"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6 text-white">
              <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/40 rounded-full px-4 py-1.5 text-gold-300 text-sm">
                <Award className="w-4 h-4" />
                Certified Naturopathy Endorsed
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                Ang <span className="text-gold-gradient">Pinaka-Natural</span>
                <br />na Wellness Drink
              </h2>
              <p className="text-forest-200 text-lg leading-relaxed">
                Ang Nature's Finest Guyabano Wine ay gawa mula sa 100% natural na pagbuburo ng Guyabano
                (<em>Annona muricata</em>). Bawat bote ay puno ng kalikasan — walang halong artificial
                additives o preservatives.
              </p>
              <ul className="space-y-3">
                {[
                  "Mayaman sa Acetogenins, Antioxidants, at Natural Probiotics",
                  "Walang halong Artificial Additives o Preservatives",
                  "Perpekto bilang pang-araw-araw na Wellness Drink",
                  "Para sa kalusugan at tamang timpla ng sarap at ginhawa",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-forest-100">
                    <CheckCircle2 className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="bg-forest-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 text-gold-300 text-sm">
              <Sparkles className="w-4 h-4" />
              Mga Benepisyo
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Bakit <span className="text-gold-gradient">Guyabano Wine?</span>
            </h2>
            <p className="text-forest-200 text-lg max-w-2xl mx-auto">
              Bawat sip ay puno ng kalikasan — suporta para sa iyong kalusugan mula sa loob
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="card-hover bg-forest-800/60 border border-forest-700/50 rounded-2xl p-6 space-y-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-lg`}>
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">{b.title}</h3>
                <p className="text-forest-200 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECOND PRODUCT IMAGE */}
      <section className="bg-gradient-to-b from-forest-900 to-forest-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-white">
              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-gold-gradient">Guyabano</span> Fruit
                <br />Goodness in Every Sip
              </h2>
              <p className="text-forest-200 text-lg leading-relaxed">
                Made from guyabano fruit known for its naturally occurring plant compounds.
                Enjoy <strong className="text-gold-300">responsibly</strong> and in moderation
                as part of a balanced lifestyle.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Leaf, label: "100% Natural" },
                  { icon: Droplets, label: "Wellness Drink" },
                  { icon: ShieldCheck, label: "Walang Preservatives" },
                  { icon: Heart, label: "Pang-araw-araw" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 bg-forest-800/40 border border-forest-700/40 rounded-xl p-3">
                    <Icon className="w-5 h-5 text-gold-400 shrink-0" />
                    <span className="text-forest-100 text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={scrollToOrder}
                className="btn-pulse animate-glow bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold px-8 py-4 rounded-full text-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-xl"
              >
                Mag-Order Na <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div>
              <img
                src="/701507958_1023553253431513_1977904653140737869_n.jpg"
                alt="Guyabano Wine Bottles"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-forest-950 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 text-gold-300 text-sm">
              <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
              Mga Testimonya
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Ano ang Sinasabi ng <span className="text-gold-gradient">Aming Customers?</span>
            </h2>
            <p className="text-forest-200 text-lg max-w-2xl mx-auto">
              Libo-libo na ang nakinabang — basahin ang kanilang mga karanasan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="card-hover bg-forest-900/80 border border-forest-700/50 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-forest-950 font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.name}</div>
                      <div className="text-forest-400 text-xs">{t.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                </div>
                <p className="text-forest-200 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-4 bg-forest-900 border border-forest-700 rounded-2xl px-8 py-5">
              <div className="text-4xl font-bold text-gold-400">4.9</div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <div className="text-forest-300 text-sm">Batay sa 500+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORDER SECTION */}
      <section ref={orderRef} className="bg-gradient-to-b from-forest-950 to-forest-900 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 text-gold-300 text-sm">
              <Phone className="w-4 h-4" />
              Mag-Order Na
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Piliin Ang Iyong
              <br />
              <span className="text-gold-gradient">Package</span>
            </h2>
            <p className="text-forest-200 text-lg">
              Punan ang form sa ibaba at makikipag-ugnayan kami sa inyo
            </p>
          </div>

          {submitted ? (
            <div className="bg-forest-800 border border-green-500/40 rounded-2xl p-10 text-center space-y-5">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Salamat sa iyong Order!</h3>
              <p className="text-forest-200 leading-relaxed">
                Natanggap na namin ang iyong impormasyon. Makikipag-ugnayan sa inyo ang aming team sa
                loob ng <strong className="text-gold-300">24 na oras</strong> para sa kumpirmasyon ng
                inyong order at delivery details.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ full_name: "", phone: "", address: "", package: "2_bottle", notes: "" });
                  setSelectedPackage("2_bottle");
                }}
                className="text-gold-400 underline text-sm hover:text-gold-300 transition-colors"
              >
                Mag-order ulit
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-forest-800/60 border border-forest-700/50 rounded-2xl p-8 space-y-6"
            >
              {/* Package selection */}
              <div className="space-y-3">
                <label className="block text-white font-semibold">Piliin ang Package</label>
                <div className="grid grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handlePackageSelect(pkg.id)}
                      className={`relative rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                        selectedPackage === pkg.id
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-forest-600 bg-forest-900/60 hover:border-forest-500"
                      }`}
                    >
                      {pkg.tag && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-forest-950 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          {pkg.tag}
                        </span>
                      )}
                      <div className="font-bold text-white text-lg">{pkg.label}</div>
                      <div className="text-gold-400 font-bold text-2xl mt-1">
                        ₱{pkg.price.toLocaleString("en-PH")}
                      </div>
                      <div className="text-forest-300 text-xs mt-1">
                        ₱{pkg.perBottle.toLocaleString("en-PH")} / bote
                      </div>
                      {selectedPackage === pkg.id && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-gold-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

             {/* Total price display */}
<div className="bg-forest-950/50 border border-gold-500/30 rounded-xl px-5 py-4 space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-forest-200 font-medium">Subtotal:</span>
    <span className="text-white font-semibold">₱{selectedPkg.price.toLocaleString("en-PH")}</span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-forest-200 font-medium">Shipping Fee:</span>
    <span className="text-forest-300 text-sm">To be calculated based on address</span>
  </div>
  <div className="border-t border-gold-500/20 pt-2 flex items-center justify-between">
    <span className="text-forest-200 font-medium">Total Amount:</span>
    <span className="text-gold-400 font-bold text-2xl">₱{selectedPkg.price.toLocaleString("en-PH")}</span>
  </div>
</div>


              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-white font-medium text-sm">
                  Buong Pangalan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Juan Dela Cruz"
                  className={`w-full bg-forest-900/60 border rounded-xl px-4 py-3 text-white placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all ${
                    errors.full_name ? "border-red-500" : "border-forest-600 focus:border-gold-500"
                  }`}
                />
                {errors.full_name && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.full_name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-white font-medium text-sm">
                  Philippine Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09XX XXX XXXX"
                    className={`w-full bg-forest-900/60 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all ${
                      errors.phone ? "border-red-500" : "border-forest-600 focus:border-gold-500"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-white font-medium text-sm">
                  Delivery Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Blk 1 Lot 2, Street Name, Barangay, Lungsod/Munisipalidad, Probinsya"
                  className={`w-full bg-forest-900/60 border rounded-xl px-4 py-3 text-white placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all resize-none ${
                    errors.address ? "border-red-500" : "border-forest-600 focus:border-gold-500"
                  }`}
                />
                {errors.address && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-white font-medium text-sm">
                  Karagdagang Tala{" "}
                  <span className="text-forest-400 font-normal">(opsyonal)</span>
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Anumang espesyal na instruksyon o katanungan..."
                  className="w-full bg-forest-900/60 border border-forest-600 focus:border-gold-500 rounded-xl px-4 py-3 text-white placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all resize-none"
                />
              </div>

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-pulse w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed text-forest-950 font-bold py-4 rounded-xl text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Pinopreno ang Order...
                  </>
                ) : (
                  <>
                    Isumite ang Order — ₱{selectedPkg.price.toLocaleString("en-PH")} + SF 
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-forest-400 text-xs text-center">
                Sa pag-submit ng form na ito, sumasang-ayon ka na makipag-ugnayan sa iyo ang aming team
                para sa kumpirmasyon ng order.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-forest-950 py-12 border-t border-forest-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h3 className="font-serif text-3xl font-bold text-white">
            Para sa mga <span className="text-gold-gradient">Katanungan</span>
          </h3>
          <p className="text-forest-200">
            Huwag mag-alinlangan na makipag-ugnayan sa amin
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:09496252124"
              className="btn-pulse flex items-center gap-3 bg-forest-800 border border-forest-600 hover:border-gold-500 text-white hover:text-gold-300 rounded-xl px-6 py-3 transition-all duration-200"
            >
              <Phone className="w-5 h-5 text-gold-400" />
              <span className="font-semibold">09496252124</span>
            </a>
          </div>
          <p className="text-forest-400 text-sm">
            Mag-Direct Message para sa mas mabilis na tugon
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-8 border-t border-forest-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-forest-400 text-sm">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-gold-500" />
              <span className="text-white font-semibold">Nature's Finest Guyabano Wine</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {["100% Natural", "Wellness Drink", "Tamang Timpla ng Sarap at Ginhawa"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                  {item}
                </span>
              ))}
            </div>
            <p className="text-xs text-center text-forest-600">
              &copy; {new Date().getFullYear()} Nature's Finest. All rights reserved.
            </p>
          </div>
          <p className="text-center text-xs text-forest-700 mt-4">
            Enjoy responsibly and in moderation as part of a balanced lifestyle. These statements have not been evaluated by the FDA.
          </p>
        </div>
      </footer>

      {/* Floating Order Button (mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
        <button
          onClick={scrollToOrder}
          className="btn-pulse animate-glow bg-gold-500 hover:bg-gold-400 text-forest-950 font-bold px-8 py-3.5 rounded-full shadow-2xl text-base flex items-center gap-2"
        >
          Order Ngayon — ₱{selectedPkg.price.toLocaleString("en-PH")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
