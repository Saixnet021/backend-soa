'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const usuariosMock = [
  { id: 1, username: 'admin', rol: 'ADMIN' as const },
  { id: 2, username: 'calidad', rol: 'QA' as const },
  { id: 3, username: 'logistica', rol: 'LOGISTICA' as const },
]

export default function UsuariosPage() {
  const badgeVariant = (rol: string) => {
    if (rol === 'ADMIN') return 'danger' as const
    if (rol === 'QA') return 'success' as const
    if (rol === 'LOGISTICA') return 'info' as const
    return 'gray' as const
  }

  return (
    <Card>
      <CardHeader><CardTitle>Usuarios del Sistema</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosMock.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell><Badge variant={badgeVariant(u.rol)}>{u.rol}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
