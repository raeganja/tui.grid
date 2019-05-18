import {
  Data,
  Row,
  Dictionary,
  Column,
  ColumnInfo,
  Formatter,
  CellRenderData,
  FormatterProps
} from './types';
import { reactive, watch, Reactive } from '../helper/reactive';
import { OptRow } from '../types';
import { encodeHTMLEntity } from '../helper/common';

function getFormattedValue(props: FormatterProps, formatter?: Formatter, defValue?: string) {
  let value: string;

  if (typeof formatter === 'function') {
    value = formatter(props);
  } else if (typeof formatter === 'string') {
    value = formatter;
  } else {
    value = defValue || '';
  }

  if (value && props.column.escapeHTML) {
    value = encodeHTMLEntity(value);
  }

  return value;
}

function createViewCell(row: Row, column: ColumnInfo): CellRenderData {
  const { name, formatter, prefix, postfix, editor } = column;
  const value = row[name];
  const formatterProps = { row, column, value };

  return {
    // @TODO: change editable/disabled using relations
    editable: !!editor,
    disabled: false,
    formattedValue: getFormattedValue(formatterProps, formatter, String(value)),
    prefix: getFormattedValue(formatterProps, prefix),
    postfix: getFormattedValue(formatterProps, postfix),
    value
  };
}

function createViewRow(row: Row, columnMap: Dictionary<ColumnInfo>) {
  const { rowKey } = row;
  const initValueMap: Dictionary<CellRenderData | null> = {};

  Object.keys(columnMap).forEach((name) => {
    initValueMap[name] = null;
  });

  const valueMap = reactive(initValueMap) as Dictionary<CellRenderData>;

  Object.keys(columnMap).forEach((name) => {
    watch(() => {
      valueMap[name] = createViewCell(row, columnMap[name]);
    });
  });

  return { rowKey, valueMap };
}

export function create(data: OptRow[], column: Column): Reactive<Data> {
  const rawData = data.map((row, index) => {
    const rowKeyAdded = { rowKey: index, _number: index + 1, _checked: false, ...row };

    return reactive(rowKeyAdded as Row);
  });

  const viewData = rawData.map((row: Row) => createViewRow(row, column.allColumnMap));

  return reactive({
    rawData,
    viewData,

    // @TODO meta 프로퍼티 값으로 변경
    get checkedAllRows() {
      const checkedRows = rawData.filter(({ _checked }) => _checked);

      return checkedRows.length === rawData.length;
    }
  });
}
