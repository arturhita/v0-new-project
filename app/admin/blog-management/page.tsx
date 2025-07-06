import BlogCMSAdvanced from "@/components/blog-cms-advanced"

export default function BlogManagementPage() {
  return (
    <div className="text-slate-200">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          Gestione Blog
        </h1>
        <p className="text-slate-400 mt-1">Crea, modifica e pubblica articoli per il tuo Astromag.</p>
      </div>
      <BlogCMSAdvanced />
    </div>
  )
}
