// Chakra imports
import {
  SimpleGrid,
  Button,
  Flex,
  Textarea,
  useColorMode,
  Input,
  Switch,
  Link,
  Spacer,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

// Custom components
import Card from "components/Card/Card.js";
import React, { useEffect, useState } from "react";
import {
  handleAddNewDiaryEntry,
  handleBrowseDiary,
  handleTextAreaKeyPress,
  getRandomFile,
  readText,
} from "../../utils";

const DiaryManager = () => {
  const { colorMode } = useColorMode();
  const [sessionPwdValidated, setSessionPwdValidated] = useState(false);
  const [inputText, setInputText] = useState("");
  const [randomText, setRandomText] = useState("");
  const [incognitoMode, setInCognitoMode] = useState(false);
  const [downloadLinkVisible, setDownloadLinkVisible] = useState(false);

  useEffect(() => {
    randomText.length === 0 &&
      getRandomFile().then((res) => setRandomText(res.data));
  });

  if (inputText.length > 0) {
    document.getElementById("diary-data-input").value = incognitoMode
      ? randomText.slice(0, inputText.length + 1)
      : inputText;
  }

  return (
    <div style={{ marginTop: "40px" }}>
      <Flex minWidth="max-content" alignItems="right" gap="2">
        <Spacer />
        <Switch
          style={{
            marginTop: "30px",
            marginBottom: "10px",
            marginRight: "15px",
          }}
          colorScheme="blue"
          isChecked={incognitoMode}
          onChange={() => setInCognitoMode(!incognitoMode)}
        />
      </Flex>
      <SimpleGrid>
        <Card
          backgroundImage={
            colorMode === "dark"
              ? "linear-gradient(180deg, #3182CE 0%, #63B3ED 100%)"
              : "linear-gradient(180deg, #7b70df 0%, #a14646 100%)"
          }
          backgroundRepeat="no-repeat"
          background="cover"
          bgPosition="10%"
          p="16px"
        >
          <Textarea
            disabled={!sessionPwdValidated}
            key="diary-data-input"
            id="diary-data-input"
            height="58vh"
            onKeyDown={(e) =>
              handleTextAreaKeyPress(e, setInputText, inputText)
            }
          ></Textarea>
        </Card>
      </SimpleGrid>
      <SimpleGrid style={{ marginTop: "10px" }} columns={2} spacing={2}>
        <Input
          key="pwd-input-session-password"
          id="pwd-input-session-password"
          onChange={(e) =>
            e.target.value.length === 16
              ? setSessionPwdValidated(true)
              : setSessionPwdValidated(false)
          }
          type="password"
        />
        <Button
          onClick={() =>
            handleAddNewDiaryEntry(inputText, setDownloadLinkVisible)
          }
          variant="primary"
          style={{
            fontSize: "15px",
            background:
              colorMode === "dark"
                ? "var(--chakra-colors-blue-400)"
                : "#bb8174",
          }}
          disabled={!sessionPwdValidated}
        >
          Submit
        </Button>
        <Link
          visibility={downloadLinkVisible ? "visible" : "hidden"}
          id="save-file-href"
          onClick={(e) => {
            e.preventDefault();
            return false;
          }}
          disabled
        >
          <ExternalLinkIcon mx="2px" />
        </Link>
      </SimpleGrid>
      <SimpleGrid columns={1} spacing={1}>
        <Button
          onClick={handleBrowseDiary}
          variant="primary"
          style={{
            fontSize: "15px",
            background:
              colorMode === "dark"
                ? "var(--chakra-colors-blue-400)"
                : "#bb8174",
          }}
          disabled={!sessionPwdValidated}
        >
          Browse
        </Button>
      </SimpleGrid>
      <input
        type="file"
        id="file1"
        style={{ display: "none" }}
        onChange={(event) => readText(event, setInputText)}
      ></input>
    </div>
  );
};

export default DiaryManager;
