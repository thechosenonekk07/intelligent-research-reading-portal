import { useEffect, useState } from 'react'
import type { FolderItem, ResearchDocument } from '../types'
import { DocumentTable } from './DocumentTable'

interface SpaceViewProps {
  mode: 'personal' | 'team'
  teamName?: string
  folders: FolderItem[]
  documents: ResearchDocument[]
  openFolderName: string | null
  page: number
  onPageChange: (page: number) => void
  onOpenFolder: (folder: FolderItem) => void
  onRenameFolder: (id: number, name: string) => void
  onDeleteFolder: (id: number) => void
  onBack: () => void
  onNewFolder: () => void
  onNewDocument: () => void
  onImportDocument: () => void
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
  onShare: (id: number) => void
  onRenameDocument: (id: number, title: string) => void
  onCreateNote: (documentItem: ResearchDocument) => void
  emptyTeam?: boolean
}

export function SpaceView({
  mode,
  teamName,
  folders,
  documents,
  openFolderName,
  page,
  onPageChange,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onBack,
  onNewFolder,
  onNewDocument,
  onImportDocument,
  onToggleFavorite,
  onDelete,
  onShare,
  onRenameDocument,
  onCreateNote,
  emptyTeam = false,
}: SpaceViewProps) {
  const label = mode === 'personal' ? '我的空间' : teamName ?? 'AI研究团队'
  const [menuFolderId, setMenuFolderId] = useState<number | null>(null)
  const [renamingFolderId, setRenamingFolderId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    if (menuFolderId === null) return
    const closeMenu = () => setMenuFolderId(null)
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  }, [menuFolderId])

  const finishRename = (folder: FolderItem) => {
    const nextName = renameValue.trim()
    if (nextName && nextName !== folder.name) onRenameFolder(folder.id, nextName)
    setRenamingFolderId(null)
    setRenameValue('')
  }

  return (
    <section className={`view view--space${mode === 'team' ? ' view--team' : ''}${emptyTeam ? ' view--empty-team' : ''}`}>
      <header className="view-header view-header--actions">
        <h1>
          <span className="title-accent" />
          {mode === 'team' ? (
            <span className="breadcrumb"><span>团队空间</span><span>/</span><strong>{label}</strong></span>
          ) : label}
        </h1>
        <div className="header-actions">
          <button className="button button--secondary" type="button" onClick={onImportDocument}>导入文档</button>
          <button className="button button--secondary" type="button" onClick={onNewDocument}>新建在线文档</button>
          <button className="button button--primary" type="button" onClick={onNewFolder}><span className="button-plus icon-plus" aria-hidden="true" />新建文件夹</button>
        </div>
      </header>
      <div className={`view-body space-body${openFolderName ? ' space-body--folder' : ''}${emptyTeam ? ' space-body--empty' : ''}`}>
        {emptyTeam ? (
          <div className="empty-team-view">
            <div className="empty-team-actions">
              <button type="button" onClick={onImportDocument}><span className="empty-action-icon"><img src="/assets/action-pdf.svg" alt="" /></span><span><strong>导入</strong><small>导入PDF文档</small></span></button>
              <button type="button" onClick={onNewDocument}><span className="empty-action-icon"><img src="/assets/action-word.svg" alt="" /></span><span><strong>新建</strong><small>新建在线文档</small></span></button>
              <button type="button" onClick={onNewFolder}><span className="empty-action-icon"><img src="/assets/action-folder.svg" alt="" /></span><span><strong>添加</strong><small>添加文件夹</small></span></button>
              <button type="button"><span className="empty-action-icon"><img src="/assets/action-manage.svg" alt="" /></span><span><strong>管理</strong><small>管理团队空间</small></span></button>
            </div>
            <div className="empty-state">
              <img src="/assets/empty-team.svg" alt="" />
              <p>这里暂无数据，点击上面按钮增添内容</p>
            </div>
          </div>
        ) : !openFolderName ? (
          <section className="folder-section" aria-labelledby="folder-title">
            <h2 id="folder-title">文件夹</h2>
            <div className="folder-grid">
              {folders.map((folder) => (
                <article className={`folder-card${menuFolderId === folder.id ? ' is-selected' : ''}`} key={folder.id}>
                  {renamingFolderId === folder.id ? (
                    <div className="folder-open">
                      <img src={folder.id % 2 === 0 ? '/assets/folder-data.svg' : '/assets/folder-research.svg'} alt="" />
                      <input
                        className="folder-rename-input"
                        autoFocus
                        value={renameValue}
                        aria-label="文件夹新名称"
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onBlur={() => finishRename(folder)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') finishRename(folder)
                          if (event.key === 'Escape') setRenamingFolderId(null)
                        }}
                      />
                    </div>
                  ) : (
                    <button className="folder-open" type="button" onClick={() => onOpenFolder(folder)}>
                      <img src={folder.id % 2 === 0 ? '/assets/folder-data.svg' : '/assets/folder-research.svg'} alt="" />
                      <span className="folder-copy">
                        <strong>{folder.name}</strong>
                        <small>{folder.count} 个项目&nbsp; 更新于 {folder.updatedAt}</small>
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="folder-more"
                    aria-label={`${folder.name}更多操作`}
                    aria-expanded={menuFolderId === folder.id}
                    onClick={(event) => { event.stopPropagation(); setMenuFolderId((current) => current === folder.id ? null : folder.id) }}
                  ><span className="more-dots" aria-hidden="true"><i /><i /><i /></span></button>
                  {menuFolderId === folder.id && (
                    <div className="folder-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                      <button type="button" role="menuitem" onClick={() => onOpenFolder(folder)}>查看</button>
                      <button type="button" role="menuitem" onClick={() => { setRenamingFolderId(folder.id); setRenameValue(folder.name); setMenuFolderId(null) }}>重命名</button>
                      <button type="button" role="menuitem" className="danger-link" onClick={() => { onDeleteFolder(folder.id); setMenuFolderId(null) }}>删除</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : (
          <nav className="folder-breadcrumb" aria-label="文件夹路径">
            <button type="button" onClick={onBack}>文件夹</button><span>/</span><button type="button" onClick={onBack}>{openFolderName}</button><span>/</span><strong>文档</strong>
          </nav>
        )}
        {!emptyTeam && <section className="documents-section" aria-labelledby="documents-title">
          {!openFolderName && <h2 id="documents-title">文档</h2>}
          <DocumentTable
            documents={documents}
            mode="space"
            page={page}
            onPageChange={onPageChange}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
            onShare={onShare}
            onRename={onRenameDocument}
            onCreateNote={onCreateNote}
          />
        </section>}
      </div>
    </section>
  )
}
