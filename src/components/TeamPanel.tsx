import { useEffect, useState } from 'react'
import type { CommentItem, MemberItem, TeamPanelTab, TodoItem } from '../types'

interface TeamPanelProps {
  tab: TeamPanelTab
  todos: TodoItem[]
  comments: CommentItem[]
  members: MemberItem[]
  onTabChange: (tab: TeamPanelTab) => void
  onToggleTodo: (id: number) => void
  onDeleteTodo: (id: number) => void
  onAddTodoRequest: () => void
  onAddComment: (content: string, attachment?: string, replyTo?: string) => void
  onInvite: () => void
  onMemberRoleChange: (id: number, role: MemberItem['role']) => void
  onRemoveMember: (id: number) => void
}

const tabs: Array<{ id: TeamPanelTab; label: string }> = [
  { id: 'todo', label: '待办' },
  { id: 'comments', label: '评论' },
  { id: 'members', label: '成员' },
]

export function TeamPanel({
  tab,
  todos,
  comments,
  members,
  onTabChange,
  onToggleTodo,
  onDeleteTodo,
  onAddTodoRequest,
  onAddComment,
  onInvite,
  onMemberRoleChange,
  onRemoveMember,
}: TeamPanelProps) {
  const [comment, setComment] = useState('')
  const [attachment, setAttachment] = useState('')
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [roleMenuMemberId, setRoleMenuMemberId] = useState<number | null>(null)
  const completedCount = todos.filter((item) => item.done).length

  useEffect(() => {
    if (roleMenuMemberId == null) return
    const close = () => setRoleMenuMemberId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [roleMenuMemberId])

  const submitComment = () => {
    if (!comment.trim() && !attachment) return
    onAddComment(comment.trim() || '已上传附件', attachment || undefined)
    setComment('')
    setAttachment('')
  }

  const submitReply = (item: CommentItem) => {
    const value = replyText.trim()
    if (!value) return
    onAddComment(value, undefined, item.author)
    setReplyToId(null)
    setReplyText('')
  }

  return (
    <aside className="team-panel" aria-label="团队协作面板">
      <div className="team-panel-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            className={tab === item.id ? 'is-active' : ''}
            aria-selected={tab === item.id}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'todo' && (
        <div className="panel-content todo-panel">
          <div className="panel-heading-row">
            <strong>待办事项·{todos.length}项</strong>
            <button className="quiet-select" type="button">最近1月<img src="/assets/direction-down.svg" alt="" /></button>
          </div>
          <div className="todo-list">
            {todos.map((todo) => (
              <article className={`todo-item${todo.done ? ' is-done' : ''}`} key={todo.id}>
                <div className="todo-title"><span className={`priority-dot priority-dot--${todo.level}`} />{todo.title}</div>
                <div className="todo-meta">
                  <span>截止：{todo.due}</span>
                  <span className="todo-actions">
                    {todo.done ? <span className="todo-complete-label">已完成</span> : <><button type="button" aria-label="删除待办" onClick={() => onDeleteTodo(todo.id)}><span className="icon-close" aria-hidden="true" /></button><button type="button" aria-label="完成待办" onClick={() => onToggleTodo(todo.id)}><span className="icon-check" aria-hidden="true" /></button></>}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className="todo-summary">
            <span>已完成 {completedCount}/{todos.length} 项</span>
            <button type="button" onClick={onAddTodoRequest}><span className="icon-plus" aria-hidden="true" />添加</button>
            <div className="progress-track"><span style={{ width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%` }} /></div>
          </div>
        </div>
      )}

      {tab === 'comments' && (
        <div className="panel-content comments-panel">
          <div className="panel-heading-row">
            <strong className="panel-title">近期评论·{comments.length}条</strong>
            <button className="quiet-select" type="button">最近1月<img src="/assets/direction-down.svg" alt="" /></button>
          </div>
          <div className="comment-list">
            {comments.map((item) => (
              <article className="comment-item" key={item.id}>
                <div className="comment-avatar">{item.author.slice(0, 1)}</div>
                <div>
                  <div className="comment-author">{item.author}{item.replyTo && <span> 回复 {item.replyTo}</span>}</div>
                  {replyToId === item.id && <div className="comment-inline-reply"><textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} autoFocus aria-label={`回复${item.author}`} /><div><button type="button" onClick={() => { setReplyToId(null); setReplyText('') }}>取消</button><button type="button" onClick={() => submitReply(item)}>确定</button></div></div>}
                  <p>{item.content}</p>
                  {item.attachment && <button type="button" className="attachment-chip"><span className="attachment-paperclip" aria-hidden="true" />{item.attachment}</button>}
                  <small>{item.time}&nbsp;&nbsp; <button type="button" className="comment-reply-trigger" onClick={() => { setReplyToId(item.id); setReplyText('') }}><span aria-hidden="true" />回复</button></small>
                </div>
              </article>
            ))}
          </div>
          <div className="comment-composer">
            <div className="comment-editor-box">
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="添加评论..." />
              {attachment && <span className="attachment-preview"><i>PDF</i><b>{attachment}</b><button type="button" aria-label="移除附件" onClick={() => setAttachment('')}><span aria-hidden="true" /></button></span>}
              <div className="comment-tools">
                <label className="upload-link"><span className="attachment-paperclip" aria-hidden="true" />附件<input type="file" onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? '')} /></label>
              </div>
            </div>
            <button className="button button--primary comment-send" type="button" onClick={submitComment}>发送评论</button>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="panel-content members-panel">
          <div className="panel-heading-row">
            <strong>团队成员·{members.length}人</strong>
            <button type="button" className="primary-link" onClick={onInvite}><img src="/assets/nav-team.svg" alt="" />邀请</button>
          </div>
          <div className="member-list">
            {members.map((member) => (
              <article className="member-item" key={member.id}>
                <span className="member-avatar member-avatar--status" style={{ background: member.color }}>{member.initials}<i className={member.status === '在线' ? 'is-online' : ''} /></span>
                <span><strong>{member.name}</strong><small>{member.status}</small></span>
                <span className="member-role-wrap">
                  <button
                    type="button"
                    className={`role-badge role-badge--${member.role === '管理员' ? 'admin' : member.role === '编辑者' ? 'editor' : 'viewer'}`}
                    aria-label={`${member.name}权限设置`}
                    aria-expanded={roleMenuMemberId === member.id}
                    disabled={member.role === '管理员'}
                    onClick={(event) => { event.stopPropagation(); setRoleMenuMemberId((current) => current === member.id ? null : member.id) }}
                  >{member.role}{member.role !== '管理员' && <img src="/assets/direction-down.svg" alt="" />}</button>
                  {roleMenuMemberId === member.id && (
                    <div className="member-role-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                      <button type="button" role="menuitem" onClick={() => { onMemberRoleChange(member.id, '管理员'); setRoleMenuMemberId(null) }}>管理员</button>
                      <button type="button" role="menuitem" className={member.role === '编辑者' ? 'is-current' : ''} onClick={() => { onMemberRoleChange(member.id, '编辑者'); setRoleMenuMemberId(null) }}>编辑者</button>
                      <button type="button" role="menuitem" className={member.role === '查看者' ? 'is-current' : ''} onClick={() => { onMemberRoleChange(member.id, '查看者'); setRoleMenuMemberId(null) }}>查看员</button>
                      <button type="button" role="menuitem" className="is-danger" onClick={() => { onRemoveMember(member.id); setRoleMenuMemberId(null) }}>可移除</button>
                    </div>
                  )}
                  <small className="member-joined-at">{member.joinedAt}</small>
                </span>
              </article>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
