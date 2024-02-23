// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Spacer,
  Text,
  useColorMode,
  useColorModeValue,
  Input,
  Select,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import IconBox from "components/Icons/IconBox";
import { HSeparator } from "components/Separator/Separator";
import React, { useEffect } from "react";
import { pwdManagerFields } from "../../variables/const";
import { FaCalculator } from "react-icons/fa";
import { RiLockUnlockLine } from "react-icons/ri";
import { getAccounts, loadAccountDetails } from "../../apiCalls";
import { useState } from "react";
import { handleAddNewAccount, validateForm } from "../../utils";
import { AccountDetails } from "./AccountDetails";

const PasswordManager = () => {
  const [currentAccounts, setCurrentAccounts] = useState({
    fetched: false,
    isFetching: false,
    accounts: [],
  });
  const [accountDetails, setAccountDetails] = useState({
    fetched: false,
    isFetching: false,
    data: undefined,
  });
  const [sessionPwdValidated, setSessionPwdValidated] = useState(false);
  // Chakra color mode
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const textColor = useColorModeValue("gray.700", "white");
  const { colorMode } = useColorMode();
  const [formValidations, setFormValidations] = useState(
    pwdManagerFields.reduce((acc, e) => {
      return { ...acc, [e.fieldIdentifier]: false };
    }, {})
  );

  useEffect(() => {
    !currentAccounts.fetched &&
      !currentAccounts.isFetching &&
      getAccounts()
        .then((res) =>
          setCurrentAccounts({
            fetched: true,
            accounts: res.data.accounts,
            isFetching: false,
          })
        )
        .catch(
          (e) =>
            console.log(e) &&
            setCurrentAccounts({
              fetched: false,
              accounts: currentAccounts.accounts,
              isFetching: false,
            })
        ) &&
      setCurrentAccounts({ fetched: false, accounts: [], isFetching: true });
  });

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Grid templateColumns={{ sm: "1fr", lg: "2fr 1.2fr" }} templateRows="1fr">
        <Box>
          <Grid
            templateColumns={{
              sm: "1fr",
              md: "1fr 1fr",
              xl: "1fr 1fr 1fr 1fr",
            }}
            templateRows={{ sm: "auto auto auto", md: "1fr auto", xl: "1fr" }}
            gap="26px"
          >
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
              h={{ sm: "100%", xl: "100%" }}
              gridArea={{ md: "1 / 1 / 4 / 4", xl: "1 / 1 / 4 / 4" }}
            >
              <CardBody h="100%" w="100%">
                <Flex
                  direction="column"
                  color="white"
                  h="100%"
                  p="0px 10px 20px 10px"
                  w="100%"
                >
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="bold">
                      Add New Account
                    </Text>
                    <Icon
                      as={RiLockUnlockLine}
                      w="48px"
                      h="auto"
                      color="gray.400"
                    />
                  </Flex>
                  <Spacer />
                  <Flex direction="column">
                    {pwdManagerFields.map((e, idx) => {
                      return (
                        <div key={`pwd-input-field-${idx}`}>
                          <label
                            style={{
                              marginRight: "10px",
                            }}
                          >
                            {e.fieldLabel + ":"}
                          </label>
                          <Input
                            required={true}
                            key={`pwd-input-${e.fieldIdentifier}`}
                            id={`pwd-input-${e.fieldIdentifier}`}
                            style={{
                              width: "100%",
                              marginBottom: "15px",
                            }}
                            type={e.fieldType}
                            onChange={(el) =>
                              setFormValidations({
                                ...formValidations,
                                [e.fieldIdentifier]: el.target.value.length > 0,
                              })
                            }
                          />
                        </div>
                      );
                    })}
                  </Flex>
                  <Button
                    onClick={handleAddNewAccount}
                    variant="primary"
                    style={{
                      fontSize: "15px",
                      background:
                        colorMode === "dark"
                          ? "var(--chakra-colors-blue-400)"
                          : "#bb8174",
                    }}
                    disabled={!validateForm(formValidations)}
                  >
                    Submit
                  </Button>
                </Flex>
              </CardBody>
            </Card>
            <Card
              p="16px"
              display="flex"
              align="center"
              justify="center"
              maxH="50%"
            >
              <CardBody>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  w="100%"
                  py="14px"
                >
                  <IconBox as="box" h={"60px"} w={"60px"} bg={iconBlue}>
                    <Icon
                      h={"24px"}
                      w={"24px"}
                      color="white"
                      as={FaCalculator}
                    />
                  </IconBox>
                  <Flex
                    direction="column"
                    m="14px"
                    justify="center"
                    textAlign="center"
                    align="center"
                    w="100%"
                  >
                    <Text fontSize="md" color={textColor} fontWeight="bold">
                      Total
                    </Text>
                    <Text
                      mb="24px"
                      fontSize="xs"
                      color="gray.400"
                      fontWeight="semibold"
                    >
                      Saved Passwords
                    </Text>
                    <HSeparator />
                  </Flex>
                  <Text fontSize="lg" color={textColor} fontWeight="bold">
                    {currentAccounts.accounts.length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </Grid>
        </Box>
        <Card
          p="22px"
          my={{ sm: "24px", lg: "0px" }}
          ms={{ sm: "0px", lg: "24px" }}
        >
          <CardHeader>
            <Flex justify="space-between" align="center" mb="1rem" w="100%">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Browse Password
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" w="100%">
              <Select id="accountSelect" placeholder="Select account">
                {currentAccounts.accounts.map((e, idx) => (
                  <option key={idx} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </Flex>
            <Flex direction="column" w="100%">
              <label
                id="session-pwd-field"
                style={{
                  marginTop: "30px",
                }}
              >
                Session Password
              </label>
              <Input
                key="pwd-input-session-password-decrypt"
                id="pwd-input-session-password-decrypt"
                style={{
                  width: "100%",
                  marginBottom: "15px",
                }}
                onChange={(e) =>
                  e.target.value.length === 16
                    ? setSessionPwdValidated(true)
                    : setSessionPwdValidated(false)
                }
                type="password"
              />

              <Button
                style={{ marginTop: "20px", fontSize: "15px" }}
                variant="outlined"
                color={colorMode === "dark" && "white"}
                borderColor={colorMode === "dark" && "white"}
                _hover={colorMode === "dark" && "none"}
                minW="110px"
                maxH="35px"
                disabled={!sessionPwdValidated}
                onClick={() =>
                  loadAccountDetails(
                    document.getElementById("accountSelect").value
                  ).then((res) =>
                    setAccountDetails({
                      fetched: true,
                      isFetching: false,
                      data: res.data,
                    })
                  )
                }
              >
                Show Details
              </Button>
              {accountDetails.data && (
                <AccountDetails
                  data={accountDetails.data}
                  sessionPassword={
                    document.getElementById(
                      "pwd-input-session-password-decrypt"
                    ).value
                  }
                  colorMode={colorMode}
                />
              )}
            </Flex>
          </CardBody>
        </Card>
      </Grid>
    </Flex>
  );
};

export default PasswordManager;
