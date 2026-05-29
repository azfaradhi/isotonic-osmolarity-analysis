import Image from 'next/image'

const TEAM = [
  { name: 'Azfa', role: 'Backend Developer', photo: '/foto1.jpeg' },
  { name: 'Barru', role: 'Frontend Developer', photo: '/foto2.jpeg' },
  { name: 'Rafif', role: 'AI Engineer', photo: '/foto3.jpeg' },
]

export default function AboutPage() {
  return (
    <div className="py-10 flex flex-col gap-10">
      <div>
        <h1 className="font-roobert font-bold text-heading text-inkwell-violet">Tentang HydraCheck</h1>
        <p className="font-roobert text-body text-inkwell-violet/60 mt-2 max-w-2xl">
          HydraCheck adalah aplikasi analisis rehidrasi yang membedakan osmolaritas dan tonisitas efektif, lalu
          menggabungkannya dengan model absorpsi SGLT1 untuk menghasilkan Rehydration Effectiveness Index (REI).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="border border-inkwell-violet p-6">
          <h2 className="font-roobert font-bold text-subheading text-inkwell-violet mb-3">Tujuan Ilmiah</h2>
          <p className="font-roobert text-body-sm text-inkwell-violet/70">
            Memverifikasi klaim isotonic pada minuman rehidrasi, menilai keseimbangan elektrolit dan gula,
            serta memberi rekomendasi penyesuaian formula secara komputasional.
          </p>
        </section>

        <section className="border border-inkwell-violet p-6">
          <h2 className="font-roobert font-bold text-subheading text-inkwell-violet mb-3">Metode Komputasi</h2>
          <p className="font-roobert text-body-sm text-inkwell-violet/70">
            Perhitungan osmolaritas menggunakan faktor disosiasi van't Hoff dan berat molekul, tonisitas efektif
            dihitung dari solute impermeant, lalu REI dirangkum dari proximity tonisitas, rasio Na:glukosa, dan skor
            absorpsi SGLT1.
          </p>
        </section>
      </div>

      <section className="border border-inkwell-violet p-6">
        <h2 className="font-roobert font-bold text-subheading text-inkwell-violet mb-5">Tim Pengembang</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center gap-2">
              <div className="w-24 h-24 rounded-full border border-inkwell-violet bg-canvas-cream overflow-hidden">
                <Image
                  src={member.photo}
                  alt={`Foto ${member.name}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-roobert font-bold text-body-sm text-inkwell-violet">{member.name}</p>
              <p className="font-roobert text-xs text-inkwell-violet/60">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-basin p-6">
        <h2 className="font-roobert font-bold text-subheading text-pure-white mb-3">Apa yang Bisa Dilakukan</h2>
        <ul className="font-roobert text-body-sm text-pure-white/80 flex flex-col gap-2 list-disc pl-5">
          <li>Menghitung osmolaritas, tonisitas efektif, dan REI dari komposisi minuman.</li>
          <li>Membandingkan produk komersial dan formula rumahan secara visual.</li>
          <li>Melatih model ML untuk memprediksi REI dari komposisi kimia.</li>
        </ul>
      </section>
    </div>
  )
}
