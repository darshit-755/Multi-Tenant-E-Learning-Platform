const TenantFooter = () => {
  return (
    <footer className="h-10 bg-slate-100 border-t text-center text-sm text-muted-foreground flex items-center justify-center">
        © {new Date().getFullYear()} Tenant Dashboard. All rights reserved.
      </footer>
  )
}

export default TenantFooter
