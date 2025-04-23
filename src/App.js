import { Flex } from "antd";

import PasswordForm from "./components/PasswordForm/PasswordForm";

import "./App.css";
import PasswordOutput from "./components/PasswordOutput/PasswordOutput";

const App = () => {
  return (
    <Flex gap="middle" align="start" vertical>
      <Flex className="App-FlexBoxStyle" justify="center" align="center">
        <PasswordForm />
        <PasswordOutput />
      </Flex>
    </Flex>
  );
};

export default App;
