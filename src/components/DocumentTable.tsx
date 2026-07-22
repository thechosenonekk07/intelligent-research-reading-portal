import { useEffect, useRef, useState } from 'react'
import type { ResearchDocument, WorkbenchTab } from '../types'

interface DocumentTableProps {
  documents: ResearchDocument[]
  mode: 'workbench' | 'space' | 'recycle'
  workbenchTab?: WorkbenchTab
  page: number
  onPageChange: (page: number) => void
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
  onShare: (id: number) => void
  onRestore?: (id: number) => void
}

function KindTag({ kind }: { kind: ResearchDocument['kind'] }) {
  return <span className={`kind-tag kind-tag--${kind === '在线文档' ? 'online' : 'file'}`}>{kind}</span>
}

function Pagination({ page, onChange }: { page: number; onChange: (page: number) => void }) {
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const pageSizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!pageSizeRef.current?.contains(event.target as Node)) setPageSizeOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPageSizeOpen(false)
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div className="pagination" aria-label="分页">
      <button type="button" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))} aria-label="上一页">
        <span className="pager-chevron pager-chevron--prev" aria-hidden="true" />
      </button>
      {[1, 2, 3, 4, 5].map((number) => (
        <button
          type="button"
          key={number}
          className={page === number ? 'is-current' : ''}
          onClick={() => onChange(number)}
          aria-current={page === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}
      <button type="button" disabled={page === 5} onClick={() => onChange(Math.min(5, page + 1))} aria-label="下一页">
        <span className="pager-chevron" aria-hidden="true" />
      </button>
      <div className="page-size" ref={pageSizeRef}>
        <button type="button" className={`page-size-trigger${pageSizeOpen ? ' is-open' : ''}`} aria-haspopup="listbox" aria-expanded={pageSizeOpen} onClick={() => setPageSizeOpen((open) => !open)}><span>{pageSize}条/页</span><span className="page-size-chevron" aria-hidden="true" /></button>
        {pageSizeOpen && <div className="page-size-menu" role="listbox" aria-label="每页显示数量">{([10, 20, 50] as const).map((size) => <button type="button" role="option" aria-selected={pageSize === size} className={pageSize === size ? 'is-active' : ''} key={size} onClick={() => { setPageSize(size); setPageSizeOpen(false) }}>{size}条/页</button>)}</div>}
      </div>
    </div>
  )
}

export function DocumentTable({
  documents,
  mode,
  workbenchTab = 'recent',
  page,
  onPageChange,
  onToggleFavorite,
  onDelete,
  onShare,
  onRestore,
}: DocumentTableProps) {
  const [spaceMenuId, setSpaceMenuId] = useState<number | null>(null)
  const isWorkbench = mode === 'workbench'
  const isFavorites = isWorkbench && workbenchTab === 'favorites'
  const isRecycle = mode === 'recycle'
  const columnCount = 4
    + (isWorkbench ? 1 : 0)
    + (!isWorkbench && !isRecycle ? 1 : 0)
    + (isWorkbench ? 1 : 0)
    + (!isFavorites ? 1 : 0)

  useEffect(() => {
    if (spaceMenuId == null) return
    const close = () => setSpaceMenuId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [spaceMenuId])

  const downloadDocument = (documentItem: ResearchDocument) => {
    const body = `${documentItem.title}\n${documentItem.owner}\n${documentItem.kind}`
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${documentItem.title}.txt`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <div className="table-region">
      <div className="table-scroll">
        <table className="document-table">
          <thead>
            <tr>
              <th>标题</th>
              {isWorkbench && <th>位置</th>}
              <th>所有者</th>
              {!isWorkbench && !isRecycle && <th>大小</th>}
              {isWorkbench && !isFavorites && <th>创建时间</th>}
              {isFavorites && <th>收藏时间</th>}
              {!isFavorites && <th>{isRecycle ? '删除时间' : '最近访问'}</th>}
              <th>文档属性</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan={columnCount}>
                  <span className="empty-mark">⌁</span>
                  暂无文档
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="title-cell">{doc.title}</td>
                  {isWorkbench && <td>{doc.location}</td>}
                  <td>
                    <span className="owner-cell">
                      <img src="/assets/avatar-owner.svg" alt="" />
                      {doc.owner}
                    </span>
                  </td>
                  {!isWorkbench && !isRecycle && <td>{doc.size}</td>}
                  {isWorkbench && !isFavorites && <td>{doc.createdAt}</td>}
                  {isFavorites && <td>{doc.createdAt}</td>}
                  {!isFavorites && <td>{doc.visitedAt}</td>}
                  <td><KindTag kind={doc.kind} /></td>
                  <td>
                    <span className="row-actions">
                      {isRecycle ? (
                        <>
                          <button type="button" onClick={() => onRestore?.(doc.id)}>恢复</button>
                          <button className="danger-link" type="button" onClick={() => onDelete(doc.id)}>彻底删除</button>
                        </>
                      ) : isWorkbench ? (
                        <>
                          {workbenchTab === 'owned' || workbenchTab === 'shared' ? (
                            <button type="button" onClick={() => onShare(doc.id)}>共享到团队</button>
                          ) : (
                            <button type="button" onClick={() => onToggleFavorite(doc.id)}>
                              {workbenchTab === 'favorites' || doc.favorite ? '取消收藏' : '收藏'}
                            </button>
                          )}
                          <button className="danger-link" type="button" onClick={() => onDelete(doc.id)}>
                            {workbenchTab === 'recent' && doc.id !== 1 ? '从列表移除' : '删除'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => onShare(doc.id)}>分享</button>
                          <span className="document-space-menu-wrap">
                            <button className="more-button" type="button" aria-label={`${doc.title}更多操作`} aria-expanded={spaceMenuId === doc.id} onClick={(event) => { event.stopPropagation(); setSpaceMenuId((current) => current === doc.id ? null : doc.id) }}><span className="more-dots" aria-hidden="true"><i /><i /><i /></span></button>
                            {spaceMenuId === doc.id && <span className="document-space-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                              <button type="button" role="menuitem" onClick={() => setSpaceMenuId(null)}>笔记</button>
                              <button type="button" role="menuitem" onClick={() => { onToggleFavorite(doc.id); setSpaceMenuId(null) }}>{doc.favorite ? '取消收藏' : '收藏'}</button>
                              <button type="button" role="menuitem" onClick={() => { downloadDocument(doc); setSpaceMenuId(null) }}>下载</button>
                              <button type="button" role="menuitem" onClick={() => setSpaceMenuId(null)}>重命名</button>
                              <button type="button" role="menuitem" className="danger-link" onClick={() => { onDelete(doc.id); setSpaceMenuId(null) }}>删除</button>
                            </span>}
                          </span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} onChange={onPageChange} />
    </div>
  )
}
