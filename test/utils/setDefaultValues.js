import test from 'ava'
// import setDefaultValues from '../../src/utils/setDefaultValues'
import setDefaultValues from '../helpers/utils/setDefaultValues'
import { isDate, isFunction } from 'is-what'

test('my recursive object assign', async t => {
  let res, defaultValues, target
  const nd = new Date()
  defaultValues = { body: 'a' }
  target = { dueDate: nd }
  res = setDefaultValues(target, defaultValues)
  t.true(isDate(res.dueDate))
  t.is(res.body, 'a')
  t.deepEqual(defaultValues, { body: 'a' })
  t.deepEqual(target, { dueDate: nd })

  defaultValues = {
    body: '',
    head: null,
    toes: { big: true },
    fingers: { '12': false },
  }
  target = { body: {}, head: {}, toes: {}, fingers: null }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, { body: {}, head: {}, toes: { big: true }, fingers: null })

  defaultValues = { body: 'a' }
  target = { body: 'b' }
  res = setDefaultValues(target, defaultValues)
  t.is(res.body, 'b')
  t.deepEqual(defaultValues, { body: 'a' })
  t.deepEqual(target, { body: 'b' })

  const newDate = new Date()
  defaultValues = {
    info: {
      time: 'now',
      newDate,
      very: {
        deep: {
          prop: false,
        },
      },
    },
  }
  target = {
    info: {
      date: 'tomorrow',
      very: {
        deep: {
          prop: true,
        },
      },
    },
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, {
    info: {
      time: 'now',
      newDate,
      date: 'tomorrow',
      very: {
        deep: {
          prop: true,
        },
      },
    },
  })
  t.deepEqual(defaultValues, {
    info: {
      time: 'now',
      newDate,
      very: {
        deep: { prop: false },
      },
    },
  })
  t.deepEqual(target, {
    info: {
      date: 'tomorrow',
      very: {
        deep: { prop: true },
      },
    },
  })
  t.true(isDate(res.info.newDate))

  defaultValues = {
    info: {
      time: { when: 'now' },
      very: {
        deep: { prop: false },
      },
    },
  }
  target = {
    info: {
      time: {},
      very: { whole: 1 },
    },
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, {
    info: {
      time: { when: 'now' },
      very: {
        deep: { prop: false },
        whole: 1,
      },
    },
  })

  defaultValues = {
    body: 'a',
    body2: { head: false },
    tail: {},
  }
  target = {
    body: { head: true },
    body2: { head: { eyes: true } },
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, {
    body: { head: true },
    body2: { head: { eyes: true } },
    tail: {},
  })
  t.deepEqual(defaultValues, {
    body: 'a',
    body2: { head: false },
    tail: {},
  })
  t.deepEqual(target, {
    body: { head: true },
    body2: { head: { eyes: true } },
  })

  defaultValues = {
    body: 'a',
    body2: { head: false },
    tail: {},
  }
  target = 'a'
  res = setDefaultValues(target, defaultValues)
  t.is(res, 'a')
  t.deepEqual(defaultValues, {
    body: 'a',
    body2: { head: false },
    tail: {},
  })
})

test('custom %convertTimestamp% defaultValue - fireBase', async t => {
  let res, defaultValues, target
  const dateStr = '1990-06-22T17:35:00'
  const dateStr2 = '2018-05-26T02:46:57.262Z'
  const nd = new Date(dateStr)
  defaultValues = {
    body: '%convertTimestamp%',
    body2: { nd: '%convertTimestamp%' },
    dateStr2: '%convertTimestamp%',
    firebase: { specialTS: { _ts: '%convertTimestamp%' } },
  }
  target = {
    body: dateStr,
    body2: { nd },
    dateStr2,
    firebase: { specialTS: { _ts: {} } },
  }
  const TimestampProto = {
    toDate: _ => {
      return nd
    },
  }
  Object.setPrototypeOf(target.firebase.specialTS._ts, TimestampProto)
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, {
    body: nd,
    body2: { nd },
    dateStr2: new Date(dateStr2),
    firebase: { specialTS: { _ts: nd } },
  })
  t.deepEqual(defaultValues, {
    body: '%convertTimestamp%',
    body2: { nd: '%convertTimestamp%' },
    dateStr2: '%convertTimestamp%',
    firebase: { specialTS: { _ts: '%convertTimestamp%' } },
  })
  t.is(target.body, dateStr)
  t.deepEqual(target.body2, { nd })
  t.true(isFunction(target.firebase.specialTS._ts.toDate))
})
test('custom %convertTimestamp% defaultValue - delete %convertTimestamp%', async t => {
  let res, defaultValues, target
  defaultValues = {
    body: '%convertTimestamp%',
    body2: { nd: '%convertTimestamp%' },
    firebase: { specialTS: { _ts: '%convertTimestamp%' } },
  }
  target = {
    body: '',
    body2: { nd: null },
    firebase: { specialTS: {} },
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, {
    body: '',
    body2: { nd: null },
    firebase: { specialTS: { _ts: null } },
  })

  defaultValues = {
    body: '%convertTimestamp%',
    soup: { time: '%convertTimestamp%' },
  }
  res = setDefaultValues({}, defaultValues)
  t.deepEqual(res, { body: null, soup: { time: null } })
})

test('overwrites null with empty object', t => {
  let res, defaultValues, target
  defaultValues = {
    body: null,
  }
  target = {
    body: {},
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, { body: {} })
})
test('overwrites null with object with props', t => {
  let res, defaultValues, target
  defaultValues = {
    body: null,
  }
  target = {
    body: { props: true },
  }
  res = setDefaultValues(target, defaultValues)
  t.deepEqual(res, { body: { props: true } })
})
