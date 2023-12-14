import styles from "./NumberInputComponent.module.scss";
import { Controller } from "react-hook-form";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";

interface INumberInputComponent {
  label: string;
  name: string;
  control: any;
  rules: any;
  adoronments: string;
  defaultValue?: number;
}

export default function NumberInputComponent({
  label,
  name,
  control,
  adoronments,
  defaultValue = 0,
  rules,
}: INumberInputComponent) {
  return (
    <div className={styles.numberInputComponent}>
      <label className={styles.label}>{label}</label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          ...rules,
          pattern: {
            value: /^[0-9]*$/,
            message: "Only numbers are allowed",
          },
        }}
        render={({ field, fieldState }) => {
          const value = Number(field.value);
          return (
            <div className={styles.renderComponent}>
              <div className={styles.inputContainer}>
                <div className={styles.inputArrowContainer}>
                  <RiArrowLeftSLine
                    className={styles.icon}
                    onClick={() => field.onChange(value - 1)}
                  />
                  <input {...field} type="text" />
                  <RiArrowRightSLine
                    className={styles.icon}
                    onClick={() => field.onChange(value + 1)}
                  />
                </div>
                <div className={styles.adornments}>{adoronments}</div>
              </div>

              <p className={styles.fieldError}>
                {fieldState?.error && fieldState.error?.message}
              </p>
            </div>
          );
        }}
      />
    </div>
  );
}
