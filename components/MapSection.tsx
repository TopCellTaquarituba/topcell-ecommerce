export default function MapSection() {
  const address = 'Rua Dr Ataliba Lionel, 519, Centro - Taquarituba, SP'
  const cep = '18740019'
  const query = encodeURIComponent(`${address} - CEP ${cep}`)
  const src = `https://www.google.com/maps?q=${query}&output=embed`
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-4 dark:text-white">Estamos localizados</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">CEP: {cep} — {address}</p>
        <div className="rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
          <iframe
            title="Localização - Google Maps"
            src={src}
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}

