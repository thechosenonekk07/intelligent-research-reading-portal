import { useEffect, useMemo, useState } from 'react'

export type CandidateRole = '查看员' | '编辑者' | '管理员'

export interface MemberCandidate {
  id: string
  name: string
  email: string
  date: string
  color: string
}

interface MemberPickerProps {
  candidates: MemberCandidate[]
  selectedIds: string[]
  roles: Record<string, CandidateRole>
  search: string
  onSearchChange: (value: string) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onRoleChange: (id: string, role: CandidateRole) => void
}

const roleOptions: CandidateRole[] = ['查看员', '编辑者', '管理员']

export function MemberPicker({
  candidates,
  selectedIds,
  roles,
  search,
  onSearchChange,
  onToggle,
  onRemove,
  onRoleChange,
}: MemberPickerProps) {
  const [openRoleId, setOpenRoleId] = useState<string | null>(null)
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const filteredCandidates = useMemo(() => candidates.filter((candidate) => (
    !normalizedSearch
    || candidate.name.toLocaleLowerCase().includes(normalizedSearch)
    || candidate.email.toLocaleLowerCase().includes(normalizedSearch)
  )), [candidates, normalizedSearch])
  const selectedCandidates = candidates.filter((candidate) => selectedIds.includes(candidate.id))

  useEffect(() => {
    if (openRoleId == null) return
    const closeRoleMenu = () => setOpenRoleId(null)
    window.addEventListener('click', closeRoleMenu)
    return () => window.removeEventListener('click', closeRoleMenu)
  }, [openRoleId])

  return (
    <div className="member-selector" aria-label="成员选择区域">
      <section className="member-selector-column member-selector-candidates" aria-label="全部成员">
        <input
          className="text-field member-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="请输入"
          aria-label="搜索成员"
          autoFocus
        />
        <h3>全部成员·80人</h3>
        <div className="candidate-list" role="list">
          {filteredCandidates.map((candidate) => {
            const selected = selectedIds.includes(candidate.id)
            return (
              <button
                className={`candidate-row${selected ? ' is-selected' : ''}`}
                type="button"
                role="checkbox"
                aria-checked={selected}
                key={candidate.id}
                onClick={() => onToggle(candidate.id)}
              >
                <span className="member-checkbox" aria-hidden="true">
                  {selected && <img src="/assets/figma/checkbox-check.svg" alt="" />}
                </span>
                <span className="member-avatar" style={{ background: candidate.color }}>{candidate.name[0]}</span>
                <span className="member-identity"><strong>{candidate.name}</strong><small>{candidate.email}</small></span>
              </button>
            )
          })}
        </div>
      </section>
      <section className="member-selector-column member-selector-selected" aria-label="已选成员">
        <h3>已选：<b>{selectedCandidates.length}</b> 人</h3>
        <div className="selected-member-list" role="list">
          {selectedCandidates.map((candidate) => {
            const role = roles[candidate.id] ?? '查看员'
            return (
              <article key={candidate.id} role="listitem">
                <span className="member-avatar" style={{ background: candidate.color }}>{candidate.name[0]}</span>
                <span className="member-identity"><strong>{candidate.name}</strong><small>{candidate.email}</small></span>
                <span className="selected-member-controls">
                  <button className="selected-member-remove" type="button" aria-label={`移除${candidate.name}`} onClick={() => onRemove(candidate.id)}>
                    <img src="/assets/figma/modal-close.svg" alt="" />
                  </button>
                  <span className="selected-member-role-wrap">
                    <button
                      className="selected-member-role"
                      type="button"
                      aria-label={`${candidate.name}权限，当前${role}`}
                      aria-expanded={openRoleId === candidate.id}
                      onClick={(event) => {
                        event.stopPropagation()
                        setOpenRoleId((current) => current === candidate.id ? null : candidate.id)
                      }}
                    >
                      {role}<img src="/assets/figma/role-chevron.svg" alt="" />
                    </button>
                    {openRoleId === candidate.id && (
                      <span className="selected-member-role-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                        {roleOptions.map((option) => (
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={role === option}
                            className={role === option ? 'is-current' : ''}
                            key={option}
                            onClick={() => {
                              onRoleChange(candidate.id, option)
                              setOpenRoleId(null)
                            }}
                          >{option}</button>
                        ))}
                      </span>
                    )}
                  </span>
                </span>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
