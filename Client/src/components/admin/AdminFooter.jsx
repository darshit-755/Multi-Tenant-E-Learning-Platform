

const adminFooter = () => {
  return (
    <footer className="h-10 bg-slate-100 border-t text-center text-sm text-muted-foreground flex items-center justify-center">
        © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
      </footer>
  )
}

export default adminFooter