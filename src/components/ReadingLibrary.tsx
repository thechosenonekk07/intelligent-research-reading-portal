import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ReadingDocument } from '../readingData'

interface ReadingLibraryProps {
  documents: ReadingDocument[]
  onDocumentsChange: (documents: ReadingDocument[]) => void
  onOpenDocument: (document: ReadingDocument) => void
  onBack: () => void
  onUpload: () => void
  onToast: (message: string) => void
}

type LibrarySection = 'all' | 'favorites'
type LibraryFilter = '全部' | '论文' | '专利' | '报告'

const documentMeta: Record<number, { date: string; tag: Exclude<LibraryFilter, '全部'> }> = {
  1: { date: '2026.07.09', tag: '论文' },
  2: { date: '2026.07.08', tag: '专利' },
  3: { date: '2026.07.07', tag: '报告' },
  4: { date: '2026.07.06', tag: '论文' },
}

const libraryTagClass: Record<Exclude<LibraryFilter, '全部'>, string> = {
  论文: 'paper',
  专利: 'patent',
  报告: 'report',
}

const trapDialogFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
  if (event.key !== 'Tab') return
  const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'))
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

export function ReadingLibrary({
  documents,
  onDocumentsChange,
  onOpenDocument,
  onBack,
  onUpload,
}: ReadingLibraryProps) {
  const [section, setSection] = useState<LibrarySection>('all')
  const [filter, setFilter] = useState<LibraryFilter>('全部')
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<'最近上传' | '最后编辑'>('最近上传')
  const [sortOpen, setSortOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<10 | 20>(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [folders, setFolders] = useState(['我的笔记库1', '我的笔记库2', '我的笔记库3'])
  const [activeFolder, setActiveFolder] = useState('我的笔记库1')
  const [expandedFolder, setExpandedFolder] = useState('我的笔记库1')
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renameFolderValue, setRenameFolderValue] = useState('')
  const [menuDocumentId, setMenuDocumentId] = useState<number | null>(null)
  const [moveDocumentId, setMoveDocumentId] = useState<number | null>(null)
  const [moveTarget, setMoveTarget] = useState('我的笔记库1')
  const [moveSearch, setMoveSearch] = useState('')
  const [moveTab, setMoveTab] = useState<'全部' | '收藏'>('全部')
  const libraryRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!libraryRef.current?.contains(event.target as Node)) return
      const target = event.target as HTMLElement
      if (!target.closest('.reading-library-filter-wrap') && !target.closest('.reading-library-sort-wrap') && !target.closest('.reading-library-page-size-wrap') && !target.closest('.reading-library-card-menu-wrap')) {
        setFilterOpen(false)
        setSortOpen(false)
        setPageSizeOpen(false)
        setMenuDocumentId(null)
      }
    }
    window.addEventListener('click', closeMenus)
    return () => window.removeEventListener('click', closeMenus)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setFilterOpen(false)
      setSortOpen(false)
      setPageSizeOpen(false)
      setMenuDocumentId(null)
      setMoveDocumentId(null)
      setNewFolderOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const visibleDocuments = useMemo(() => {
    let list = section === 'favorites' ? documents.filter((document) => document.favorite) : documents
    if (filter !== '全部') list = list.filter((document) => (documentMeta[document.id]?.tag ?? '论文') === filter)
    const keyword = search.trim().toLowerCase()
    if (keyword) list = list.filter((document) => `${document.title}${document.authors}${document.journal}`.toLowerCase().includes(keyword))
    return sortMode === '最近上传' ? list : list.slice().reverse()
  }, [documents, filter, search, section, sortMode])

  const toggleFavorite = (documentId: number) => {
    onDocumentsChange(documents.map((document) => document.id === documentId ? { ...document, favorite: !document.favorite } : document))
  }

  const commitNewFolder = () => {
    const name = newFolderName.trim()
    if (!name) {
      setNewFolderOpen(false)
      return
    }
    setFolders((current) => [...current, name])
    setActiveFolder(name)
    setExpandedFolder(name)
    setNewFolderName('')
    setNewFolderOpen(false)
  }

  const commitFolderRename = () => {
    if (renamingFolder == null) return
    const value = renameFolderValue.trim()
    if (value && value !== renamingFolder) {
      setFolders((current) => current.map((folder) => folder === renamingFolder ? value : folder))
      if (activeFolder === renamingFolder) setActiveFolder(value)
      if (expandedFolder === renamingFolder) setExpandedFolder(value)
    }
    setRenamingFolder(null)
    setRenameFolderValue('')
  }

  const confirmMove = () => {
    if (moveDocumentId == null) return
    onDocumentsChange(documents.map((document) => document.id === moveDocumentId ? { ...document, folder: moveTarget } : document))
    setMoveDocumentId(null)
    setActiveFolder(moveTarget)
  }

  const downloadDocument = (documentItem: ReadingDocument) => {
    const body = [
      documentItem.title,
      `作者：${documentItem.authors}`,
      `来源：${documentItem.journal}（${documentItem.year}）`,
      `文件类型：${documentItem.type}`,
    ].join('\n')
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${documentItem.title}.txt`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const folderDocuments = documents.filter((document) => document.folder === activeFolder).slice(0, 4)

  return (
    <section className="reading-library-frame" ref={libraryRef} aria-label="智能阅读库">
      <header className="reading-library-header">
        <div><button type="button" aria-label="返回阅读" onClick={onBack}><img className="reading-library-back" src="/assets/reading/back.svg" alt="" /></button><h1>智能阅读库</h1></div>
        <label className="reading-library-search"><img src="/assets/reading/search.svg" alt="" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索文献标题、作者或期刊" aria-label="搜索智能阅读库" /></label>
      </header>

      <aside className="reading-library-sidebar">
        <div className="reading-library-rail" role="tablist" aria-label="阅读库分类">
          <button type="button" role="tab" aria-selected={section === 'all'} className={section === 'all' ? 'is-active' : ''} onClick={() => setSection('all')} aria-label="全部笔记"><img src="/assets/reading/library-note.svg" alt="" /></button>
          <button type="button" role="tab" aria-selected={section === 'favorites'} className={section === 'favorites' ? 'is-active' : ''} onClick={() => setSection('favorites')} aria-label="我的收藏"><img src="/assets/reading/library-favorite.svg" alt="" /></button>
        </div>
        <div className="reading-library-tree">
          <div className="reading-library-tree-heading"><h2>{section === 'favorites' ? '收藏' : '笔记'}</h2><button type="button" aria-label="新建文件夹" onClick={() => setNewFolderOpen(true)}><img src="/assets/reading/create-folder.svg" alt="" /></button></div>
          {section === 'all' ? (
            <div className="reading-folder-tree">
              {newFolderOpen && <div className="reading-new-folder-row"><img className="reading-folder-chevron is-collapsed" src="/assets/reading/library-folder.svg" alt="" /><input value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') commitNewFolder(); if (event.key === 'Escape') setNewFolderOpen(false) }} onBlur={commitNewFolder} autoFocus placeholder="" /></div>}
              {folders.map((folder, index) => (
                <div key={folder}>
                  {renamingFolder === folder ? <div className="reading-new-folder-row is-renaming"><img className={`reading-folder-chevron${expandedFolder === folder ? '' : ' is-collapsed'}`} src="/assets/reading/library-folder.svg" alt="" /><input value={renameFolderValue} onChange={(event) => setRenameFolderValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') commitFolderRename(); if (event.key === 'Escape') setRenamingFolder(null) }} onBlur={commitFolderRename} autoFocus /></div> : <button
                    type="button"
                    className={`reading-folder-row${activeFolder === folder ? ' is-active' : ''}`}
                    onClick={() => {
                      setActiveFolder(folder)
                      setExpandedFolder((current) => current === folder ? '' : folder)
                    }}
                  ><img className={`reading-folder-chevron${expandedFolder === folder ? '' : ' is-collapsed'}`} src="/assets/reading/library-folder.svg" alt="" /><img className="reading-folder-icon" src="/assets/reading/library-folder-shape.svg" alt="" />{folder}</button>}
                  {expandedFolder === folder && index === 0 && <div className="reading-folder-docs">{folderDocuments.map((document, documentIndex) => <button type="button" className={documentIndex === 0 ? 'is-active' : ''} key={document.id} onClick={() => onOpenDocument(document)}><img src={documentIndex === 0 ? '/assets/reading/notes-active.svg' : '/assets/reading/notes.svg'} alt="" />{document.title}</button>)}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="reading-folder-tree">
              {['我的收藏1', '我的收藏2'].map((folder, index) => <div key={folder}><button type="button" className={`reading-folder-row${index === 0 ? ' is-active' : ''}`}><img className={`reading-folder-chevron${index === 0 ? '' : ' is-collapsed'}`} src="/assets/reading/library-folder.svg" alt="" /><img className="reading-folder-icon" src="/assets/reading/library-folder-shape.svg" alt="" />{folder}</button>{index === 0 && <div className="reading-folder-docs">{documents.filter((document) => document.favorite).map((document, documentIndex) => <button type="button" className={documentIndex === 0 ? 'is-active' : ''} key={document.id} onClick={() => onOpenDocument(document)}><img src={documentIndex === 0 ? '/assets/reading/notes-active.svg' : '/assets/reading/notes.svg'} alt="" />{document.title}</button>)}</div>}</div>)}
            </div>
          )}
        </div>
      </aside>

      <main className="reading-library-main">
        <div className="reading-library-toolbar">
          <div className="reading-library-filter-wrap">
            <button type="button" className={filterOpen ? 'is-open' : ''} onClick={(event) => { event.stopPropagation(); setSortOpen(false); setPageSizeOpen(false); setFilterOpen((open) => !open) }}>{filter}<img className={filterOpen ? 'is-open' : ''} src="/assets/direction-down.svg" alt="" /></button>
            {filterOpen && <div className="reading-library-filter-menu" role="menu">{(['全部', '论文', '专利', '报告'] as LibraryFilter[]).map((item) => <button type="button" role="menuitem" className={filter === item ? 'is-active' : ''} key={item} onClick={() => { setFilter(item); setFilterOpen(false) }}>{item}</button>)}</div>}
          </div>
          <div className="reading-library-sort-wrap">
            <button type="button" className={`reading-library-sort${sortOpen ? ' is-open' : ''}`} onClick={(event) => { event.stopPropagation(); setFilterOpen(false); setPageSizeOpen(false); setSortOpen((open) => !open) }}><span>排序</span><i /><b className="reading-library-sort-value">{sortMode}</b><img className={sortOpen ? 'is-open' : ''} src="/assets/direction-down.svg" alt="" /></button>
            {sortOpen && <div className="reading-library-sort-menu">{(['最近上传', '最后编辑'] as const).map((mode) => <button type="button" className={sortMode === mode ? 'is-active' : ''} key={mode} onClick={() => { setSortMode(mode); setSortOpen(false) }}>{mode}</button>)}</div>}
          </div>
        </div>

        <div className="reading-library-card-grid">
          {visibleDocuments.map((document, index) => {
            const meta = documentMeta[document.id] ?? { date: '2026.07.10', tag: '论文' as const }
            return <article className={`reading-library-card${index === 0 ? ' is-selected' : ''}`} key={document.id}>
              <img className="reading-library-file-icon" src={document.type === 'PDF' ? '/assets/reading/pdf.svg' : '/assets/reading/docx.svg'} alt="" />
              <div className="reading-library-card-body">
                <button type="button" className="reading-library-card-title" onClick={() => onOpenDocument(document)}>{document.title}</button>
                <div className="reading-library-card-meta">
                  <button type="button" className={`reading-library-star${document.favorite ? ' is-active' : ''}`} aria-label={document.favorite ? '取消收藏' : '收藏'} onClick={() => toggleFavorite(document.id)}><img src={document.favorite ? '/assets/reading/star.svg' : '/assets/reading/star-outline.svg'} alt="" /></button>
                  <span className={`reading-library-tag reading-library-tag--${libraryTagClass[meta.tag]}`}>{meta.tag}</span><span>{meta.date}</span><span>{document.size.replace(' ', '')}</span>
                  <span className="reading-library-card-spacer" />
                  <button type="button" className="reading-library-edit" onClick={() => onOpenDocument(document)}>编辑</button>
                  <div className="reading-library-card-menu-wrap">
                    <button type="button" aria-label={`${document.title}更多操作`} onClick={(event) => { event.stopPropagation(); setMenuDocumentId((current) => current === document.id ? null : document.id) }}><span className="reading-more-dots" aria-hidden="true" /></button>
                    {menuDocumentId === document.id && <div className="reading-library-more-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setMoveDocumentId(document.id); setMoveTarget(document.folder); setMenuDocumentId(null) }}>移动</button><button type="button" role="menuitem" onClick={() => { setMenuDocumentId(null); downloadDocument(document) }}>下载</button><button type="button" role="menuitem" onClick={() => { onDocumentsChange(documents.filter((item) => item.id !== document.id)); setMenuDocumentId(null) }}>删除</button></div>}
                  </div>
                </div>
              </div>
            </article>
          })}
          {visibleDocuments.length === 0 && <div className="reading-library-empty"><img src="/assets/reading/notes-empty.svg" alt="" /><h3>暂无文献</h3><p>上传文件或切换筛选条件查看内容</p><button type="button" onClick={onUpload}>上传文件</button></div>}
        </div>

        <div className="reading-library-pagination">
          <button type="button" disabled={page === 1} aria-label="上一页" onClick={() => setPage((current) => Math.max(1, current - 1))}><span className="reading-page-chevron is-prev" /></button>
          {[1, 2, 3, 4, 5].map((number) => <button type="button" className={page === number ? 'is-active' : ''} aria-current={page === number ? 'page' : undefined} key={number} onClick={() => setPage(number)}>{number}</button>)}
          <button type="button" disabled={page === 5} aria-label="下一页" onClick={() => setPage((current) => Math.min(5, current + 1))}><span className="reading-page-chevron" /></button>
          <div className="reading-library-page-size-wrap">
            <button type="button" className={`reading-page-size-trigger${pageSizeOpen ? ' is-open' : ''}`} aria-haspopup="listbox" aria-expanded={pageSizeOpen} onClick={() => setPageSizeOpen((open) => !open)}><span>{pageSize}条/页</span><span className="reading-page-size-chevron" aria-hidden="true" /></button>
            {pageSizeOpen && <div className="reading-page-size-menu" role="listbox" aria-label="每页显示数量">{([10, 20] as const).map((size) => <button type="button" role="option" aria-selected={pageSize === size} className={pageSize === size ? 'is-active' : ''} key={size} onClick={() => { setPageSize(size); setPage(1); setPageSizeOpen(false) }}>{size}条/页</button>)}</div>}
          </div>
        </div>
      </main>

      {moveDocumentId != null && <div className="reading-library-overlay"><section className="reading-move-modal" role="dialog" aria-modal="true" aria-labelledby="reading-move-title" onKeyDown={trapDialogFocus}><header><h2 id="reading-move-title">移动笔记</h2><button type="button" className="reading-dialog-close" aria-label="关闭移动笔记" onClick={() => setMoveDocumentId(null)} /></header><input className="reading-move-search" value={moveSearch} onChange={(event) => setMoveSearch(event.target.value)} placeholder="搜索" autoFocus /><div className="reading-move-tabs"><button type="button" className={moveTab === '全部' ? 'is-active' : ''} onClick={() => setMoveTab('全部')}>全部</button><button type="button" className={moveTab === '收藏' ? 'is-active' : ''} onClick={() => setMoveTab('收藏')}>收藏</button></div><div className="reading-move-folders">{folders.filter((folder) => folder.includes(moveSearch.trim())).map((folder) => <button type="button" className={moveTarget === folder ? 'is-active' : ''} onClick={() => setMoveTarget(folder)} key={folder}><span className="reading-folder-shape" aria-hidden="true" />{folder}{moveTarget === folder && <img src="/assets/selected-check.svg" alt="" />}</button>)}</div><footer><button type="button" onClick={() => setMoveDocumentId(null)}>取消</button><button type="button" className="reading-primary-button" onClick={confirmMove}>移动</button></footer></section></div>}
    </section>
  )
}
