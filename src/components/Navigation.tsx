import type { Section } from '../types'

const stats: Array<{
  section: Section
  label: string
  count: number
  icon: string
  tone: string
}> = [
  { section: 'workbench', label: '工作台', count: 85, icon: '/assets/nav-workbench.svg', tone: 'blue' },
  { section: 'personal', label: '我的空间', count: 128, icon: '/assets/nav-personal.svg', tone: 'cyan' },
  { section: 'team', label: '团队空间', count: 342, icon: '/assets/nav-team.svg', tone: 'purple' },
  { section: 'recycle', label: '回收站', count: 12, icon: '/assets/nav-trash.svg', tone: 'orange' },
]

interface TopNavigationProps {
  activeSection: Section
  onSelect: (section: Section) => void
  onReadingSelect: () => void
}

export function TopNavigation({ activeSection, onSelect, onReadingSelect }: TopNavigationProps) {
  return (
    <>
      <div className="product-row">
        <div className="product-tabs" role="tablist" aria-label="产品切换">
          <button className="product-tab product-tab--active" type="button" role="tab" aria-selected="true">
            智能科研
          </button>
          <button className="product-tab" type="button" role="tab" aria-selected="false" onClick={onReadingSelect}>
            智能阅读
          </button>
        </div>
        <button className="profile-button" type="button" aria-label="个人中心">
          <img src="/assets/avatar-user.svg" alt="" />
        </button>
      </div>
      <nav className="stats-nav" aria-label="科研空间概览">
        <div className="stats-track">
          {stats.map((item, index) => (
            <div className="stat-wrap" key={item.section}>
              <button
                type="button"
                className={`stat-item${activeSection === item.section ? ' is-current' : ''}`}
                onClick={() => onSelect(item.section)}
                aria-current={activeSection === item.section ? 'page' : undefined}
              >
                <span className={`stat-icon stat-icon--${item.tone}`}>
                  <img src={item.icon} alt="" />
                </span>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </button>
              {index < stats.length - 1 && <span className="stat-divider" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}

interface SidebarProps {
  activeSection: Section
  activeTeam: string
  teamNames: string[]
  onSectionSelect: (section: Section) => void
  onTeamSelect: (team: string) => void
  onNewTeam: () => void
}

const primaryItems: Array<{ section: Section; label: string }> = [
  { section: 'workbench', label: '工作台' },
  { section: 'personal', label: '我的空间' },
  { section: 'team', label: '团队空间' },
  { section: 'recycle', label: '回收站' },
]

export function Sidebar({
  activeSection,
  activeTeam,
  teamNames,
  onSectionSelect,
  onTeamSelect,
  onNewTeam,
}: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="功能导航">
      <div className="sidebar-scroll">
        {primaryItems.map((item) => (
          <div className="sidebar-group" key={item.section}>
            <div className={item.section === 'team' ? 'sidebar-parent-row' : undefined}>
              <button
                type="button"
                className={`sidebar-item${activeSection === item.section && item.section !== 'team' ? ' is-active' : ''}${activeSection === item.section && item.section === 'team' ? ' is-parent-active' : ''}`}
                onClick={() => onSectionSelect(item.section)}
                aria-current={activeSection === item.section ? 'page' : undefined}
              >
                <span>{item.label}</span>
                {item.section === 'team' && <img className={`sidebar-chevron${activeSection === 'team' ? ' is-open' : ''}`} src="/assets/direction-down.svg" alt="" />}
              </button>
              {item.section === 'team' && <button type="button" className="sidebar-team-add" aria-label="新增团队空间" onClick={onNewTeam}><span aria-hidden="true" /></button>}
            </div>
            {item.section === 'team' && activeSection === 'team' && (
              <div className="team-tree">
                {teamNames.map((team) => (
                  <button
                    type="button"
                    key={team}
                    className={`sidebar-item sidebar-item--child${activeTeam === team ? ' is-active' : ''}`}
                    onClick={() => onTeamSelect(team)}
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
