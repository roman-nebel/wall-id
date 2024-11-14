type LogicalOperator<T> = {
  $not?: T | Array<T | LogicalOperators<T>>;
};
type ValueSource = "query" | "body" | "params";

type BaseVariant = {
  required?: true;
  source: ValueSource;
};

type CustomVariant = (data: any) => boolean;

type BooleanVariant = BaseVariant & {
  type: "boolean";
  value?: boolean | LogicalOperator<boolean>;
};

type StringVariantByValue = {
  value?: string | RegExp | string[] | LogicalOperator<string>;
};

type StringVariantByFixLength = {
  length?: number | number[] | LogicalOperator<number>;
};

type StringVariantByRangeLength = {
  minLength?: number;
  maxLength?: number;
};

type StringVariantByRegExp = {
  regExp?: RegExp;
};

type StringVariant = { type: "string" } & BaseVariant &
  (
    | StringVariantByValue
    | StringVariantByFixLength
    | StringVariantByRangeLength
    | StringVariantByRegExp
  );

type NumberVariantByValue = {
  value?: number | number[] | LogicalOperator<number>;
};

type NumberVariantByRange = {
  minValue?: number;
  maxValue?: number;
};

type NumberVariant = { type: "number" } & BaseVariant &
  (NumberVariantByValue | NumberVariantByRange);

type ChildVariant = string | number | Variant;

type ArrayVariant = { type: "array"; value: (string | number | Variant)[] };
type ObjectVariant = {
  type: "object";
  value: Record<string, string | number | Variant>;
};

type Variant =
  | BooleanVariant
  | StringVariant
  | NumberVariant
  | ArrayVariant
  | ObjectVariant;
