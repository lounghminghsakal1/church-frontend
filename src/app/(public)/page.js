import PriestAvailabilitySection from "@/components/pages_components/PriestAvailabilitySection";
import HeroSection from "@/components/pages_components/HeroSection";

export default function PublicHomePage() {
  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Priest Availability */}
      <section id="priest" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-[#C9A84C] uppercase text-xs tracking-[0.3em] font-sans mb-2">Parish Priest</p>
          <h2 className="text-3xl text-[#0F2A4A] font-serif font-semibold">Priest Availability</h2>
          <div className="mt-3 h-[2px] w-16 bg-[#C9A84C] mx-auto rounded-full" />
        </div>
        <PriestAvailabilitySection />
      </section>

      {/* Divider */}
      <Divider />

      {/* Services Placeholder */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16">
        <SectionPlaceholder
          label="Parish Services"
          title="Our Services"
          description="Services card with application link — coming soon"
        />
      </section>

      <Divider />

      {/* Activities Placeholder */}
      <section id="activities" className="max-w-6xl mx-auto px-6 py-16">
        <SectionPlaceholder
          label="Events & Calendar"
          title="Upcoming Activities"
          description="Upcoming activities section — coming soon"
        />
      </section>

      <Divider />

      {/* Contact Placeholder */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-16">
        <SectionPlaceholder
          label="Get in Touch"
          title="Contact & Schedule a Meeting"
          description="Contact priest / request schedule for meeting form — coming soon"
        />
      </section>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 max-w-2xl mx-auto px-6">
      <div className="flex-1 h-px bg-[#0F2A4A]/10" />
      <div className="w-2 h-2 rounded-full bg-[#C9A84C]/50 rotate-45" />
      <div className="flex-1 h-px bg-[#0F2A4A]/10" />
    </div>
  );
}

function SectionPlaceholder({ label, title, description }) {
  return (
    <div className="text-center">
      <p className="text-[#C9A84C] uppercase text-xs tracking-[0.3em] font-sans mb-2">{label}</p>
      <h2 className="text-3xl text-[#0F2A4A] font-serif font-semibold">{title}</h2>
      <div className="mt-3 h-[2px] w-16 bg-[#C9A84C] mx-auto rounded-full mb-8" />
      <div className="border-2 border-dashed border-[#0F2A4A]/15 rounded-lg py-20 px-10 bg-[#F3EDE3]/50">
        <p className="text-[#0F2A4A]/40 font-sans text-sm italic">{description}</p>
      </div>
    </div>
  );
}