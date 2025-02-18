import { LevaInputProps } from 'leva/dist/declarations/src/types';
import { Components, createPlugin, useInputContext } from 'leva/plugin';

const { Label, Row, String } = Components;

export type PasswordInputProps = LevaInputProps<string>;

export const LevaPasswordInput = () => {
  const { label, displayValue, onUpdate, onChange } = useInputContext<PasswordInputProps>();

  return (
    <Row input>
      <Label>{label}</Label>
      <String inputType="password" displayValue={displayValue} onUpdate={onUpdate} onChange={onChange} />
    </Row>
  );
};

export const passwordInput = createPlugin<{ label: string; value: string }, string, {}>({
  component: LevaPasswordInput,
});
