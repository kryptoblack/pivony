import styles from "./TextInputComponent.module.scss";
import { Controller } from "react-hook-form";

interface ITextInputComponent {
  label: string;
  name: string;
  control: any;
  rules: any;
  placeholder: string;
  defaultValue?: string;
  disabled?: boolean;
}

export default function TextInputComponent({
  label,
  name,
  control,
  rules,
  placeholder,
  defaultValue = "",
  disabled = false,
}: ITextInputComponent) {
  return (
    <div className={styles.textInputComponent}>
      <label className={styles.label}>{label}</label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={rules}
        render={({ field, fieldState }) => (
          <div className={styles.renderComponent}>
            <input
              {...field}
              placeholder={placeholder}
              className={styles.input}
              disabled={disabled}
              autoComplete="off"
            />
            <p className={styles.fieldError}>
              {fieldState?.error && fieldState.error?.message}
            </p>
          </div>
        )}
      />
    </div>
  );
}
