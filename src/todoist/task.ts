import { AlfredError } from '@/project';
import { Label } from '@/todoist/label';
import { Project } from '@/todoist/project';
import { Item, List, View } from '@/workflow';
import formatDistance from 'date-fns/formatDistance';
import { de, enUS, es, fr, it, nl, ptBR, ru, sv, zhCN } from 'date-fns/locale';
import compose from 'stampit';

// import da from 'date-fns/locale/da'
// import ko from 'date-fns/locale/ko'
// import pl from 'date-fns/locale/pl'
// import ja from 'date-fns/locale/ja';
export type locale =
  | 'da'
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'it'
  | 'ja'
  | 'ko'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sv'
  | 'zh'

const locales = {
  da: enUS,
  de,
  en: enUS,
  es,
  fr,
  it,
  ja: enUS,
  ko: enUS,
  nl,
  pl: enUS,
  pt: ptBR,
  ru,
  sv,
  zh: zhCN
}

export interface Task {
  [index: string]:
    | undefined
    | string
    | number
    | number[]
    | Label[]
    | Project
    | {
        date?: string
        recurring?: boolean
        datetime?: string
        string?: string
        timezone?: string
      }
  content: string
  due?: {
    date?: string
    recurring?: boolean
    datetime?: string
    string?: string
    timezone?: string
  }
  due_string?: string
  due_lang?: string
  id?: number
  label_ids?: number[]
  project_id?: number
  url?: string
  priority?: number
  project?: Project
  labels?: Label[]
}

export interface TaskList extends workflow.List {}

export const Task = compose({
  init(this: Task, task: Task = { content: '' }) {
    if (!task.content || task.content === '') {
      throw new AlfredError(`A task must have a content (${task.content}) property`)
    }

    Object.assign(this, task)
  }
})

export const TaskList = compose(
  List,
  {
    init(
      this: workflow.List,
      {
        tasks = [],
        action = 'COMPLETE',
        locale = 'en'
      }: { tasks: Task[]; action: string; locale: locale }
    ) {
      tasks.forEach((task: Task) => {
        const { content, project, labels = [], priority, due, due_string } = task
        let view: workflow.View = View()
        let name = (project && project.name) || ''
        let date: Date

        if (due && due.date) {
          date = new Date(due.date)
        }

        if (due && due.datetime) {
          date = new Date(due.datetime)
        }

        let item = Item({
          arg: task,
          title: `${action}: ${content}`,
          subtitle: view.template(
            ({ upperCase, ws, when }) =>
              `${when(name, upperCase(name), 'INBOX')}${when(
                labels.length > 0,
                `${ws(10)}\uFF20 ${labels.map(label => label.name)}`,
                ''
              )}${when(
                priority && priority > 1,
                `${ws(10)}\u203C ${priority && 5 - priority}`,
                ''
              )}${when(
                date,
                `${ws(10)}\u29D6 ${formatDistance(date, new Date(), {
                  addSuffix: true,
                  locale: locales[locale]
                })}`,
                ''
              )}${when(due_string, `${ws(10)}\u29D6 ${due_string}`, '')}`
          )
        })

        this.items.push(item)
      })
    }
  }
)
