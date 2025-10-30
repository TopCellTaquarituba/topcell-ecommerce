import Link from 'next/link'

export default function AccountGatewayPage() {
  return (
    <div className="container-custom py-16">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Minha Conta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/signin" className="group block rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Já tenho conta</h2>
          <p className="text-gray-600 dark:text-gray-400">Entrar com meus dados cadastrados.</p>
          <div className="mt-4 text-primary-600 group-hover:underline">Ir para login →</div>
        </Link>
        <Link href="/signup" className="group block rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Quero me cadastrar</h2>
          <p className="text-gray-600 dark:text-gray-400">Criar minha conta informando email e CPF/CNPJ.</p>
          <div className="mt-4 text-primary-600 group-hover:underline">Criar conta →</div>
        </Link>
      </div>
    </div>
  )
}
