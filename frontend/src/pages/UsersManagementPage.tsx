import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, Mail, CheckCircle2, Lock } from 'lucide-react'
import { DataTable, Column } from '../components/ui/DataTable'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LoadingState } from '../components/ui/LoadingState'

interface UserItem {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at?: string
}

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data)
        } else {
          setUsers([
            {
              id: 'u-1',
              email: 'national.officer@skillsentinel.gov.in',
              full_name: 'Dr. Rajesh Sharma',
              role: 'NATIONAL_OFFICER',
              is_active: true,
            },
            {
              id: 'u-2',
              email: 'delhi.director@skillsentinel.gov.in',
              full_name: 'Pooja Verma, IAS',
              role: 'STATE_OFFICER',
              is_active: true,
            },
            {
              id: 'u-3',
              email: 'district.magistrate@skillsentinel.gov.in',
              full_name: 'Vikram Rawat',
              role: 'DISTRICT_OFFICER',
              is_active: true,
            },
            {
              id: 'u-4',
              email: 'inspector.ar@skillsentinel.gov.in',
              full_name: 'Amitabh Sen',
              role: 'INSPECTION_OFFICER',
              is_active: true,
            },
          ])
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const columns: Column<UserItem>[] = [
    {
      key: 'full_name',
      header: 'Officer Name & Email',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.full_name}</div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
          {row.role.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <StatusBadge status={row.is_active ? 'HEALTHY' : 'CRITICAL'} />
      ),
    },
  ]

  if (loading) return <LoadingState message="Loading officer directory..." />

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Security & Access Control
        </span>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Officer & User Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-Based Access Control (RBAC) jurisdictional credentials
        </p>
      </div>

      <DataTable columns={columns} data={users} keyExtractor={(u) => u.id} pageSize={10} />
    </div>
  )
}
