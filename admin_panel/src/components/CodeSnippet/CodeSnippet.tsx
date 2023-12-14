import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import { useState } from "react";

import styles from "./CodeSnippet.module.scss";
import classNames from "classnames";

interface ICodeSnippetProps {
  codeSnippet: string;
}

export default function CodeSnippet({ codeSnippet }: ICodeSnippetProps) {
  const [copyIconClicked, setCopyIconClicked] = useState(false);
  return (
    <div className={styles.codeContainer}>
      <SyntaxHighlighter
        language="html"
        style={dracula}
        copyable={"true"}
        wrapLines={true}
        wrapLongLines={true}
      >
        {codeSnippet}
      </SyntaxHighlighter>
      <div
        className={classNames(
          styles.copyIconContainer,
          copyIconClicked ? styles.copyIconClicked : styles.copyIconNotClicked,
        )}
        onClick={() => {
          // Copy to clipboard
          navigator.clipboard.writeText(codeSnippet);
          setCopyIconClicked(true);
          setTimeout(() => setCopyIconClicked(false), 1000);
        }}
      >
        <HiOutlineClipboardCopy />
      </div>
    </div>
  );
}
