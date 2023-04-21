import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FocusEvent, useState } from "react";
import { BiDotsHorizontalRounded, BiPlus } from "react-icons/bi";
import {
  createWorkspaceCategoryApi,
  getWorkspaceCategoriesApi,
  removeWorkspaceCategoryApi,
  updateWorkspaceCategoryApi,
} from "src/apis/workspace/apis";
import { workspaceQueryKeys } from "src/apis/workspace/queryKeys";
import { Category } from "src/apis/workspace/types";
import Header from "src/components/worksapce/Header";
import { useWorkspaceId } from "src/components/worksapce/hooks/useWorkspaceId";
import { NextPageWithAuth } from "src/types";
import styled from "styled-components";
import { Button, Dropdown, Flex, Icon, Input, Text } from "ui";
import { v4 as uuidv4 } from "uuid";

const Categories: NextPageWithAuth = () => {
  const workspaceId = useWorkspaceId();

  const { data = [] } = useQuery(
    workspaceQueryKeys.getWorkspaceCategories(workspaceId),
    () => getWorkspaceCategoriesApi({ workspaceId }),
    {
      select: ({ data }) => data,
    }
  );

  const filterData = data.filter((item) => !item.parentFolderId);

  return (
    <Flex direction="column" fullHeight fullWidth>
      <Header />
      <Container>
        <ContentContainer direction="column" gap={24}>
          <Flex align="center" fullWidth justify="space-between">
            <Text size="xxxlarge" weight="bold">
              Categories
            </Text>

            <Button
              leadingIcon={
                <Icon>
                  <BiPlus />
                </Icon>
              }
            >
              New
            </Button>
          </Flex>
          <Flex direction="column">
            {filterData.map((item) => (
              <CategoryItem
                {...item}
                key={`catetory-item-${item.id}`}
                data={data}
              />
            ))}
          </Flex>
        </ContentContainer>
      </Container>
    </Flex>
  );
};

interface ItemProps extends Category {
  data: Category[];
}

const CategoryItem: React.FC<ItemProps> = ({
  name,
  id,
  data,
  parentFolderId,
}) => {
  const children = data.filter((item: Category) => item.parentFolderId === id);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const [isEdit, setIsEdit] = useState(false);

  const onChangeTitle = (e: FocusEvent<HTMLInputElement, Element>) => {
    setIsEdit(false);
    updateWorkspaceCategoryMutate({
      name: e.target.value,
      categoryId: id,
      parentFolderId,
      workspaceId: workspaceId,
    });
  };

  const { mutate: removeWorkspaceCategoryMutate } = useMutation(
    removeWorkspaceCategoryApi,
    {
      onMutate: () => {
        const key = workspaceQueryKeys.getWorkspaceCategories(workspaceId);
        const oldUserData = queryClient.getQueryData(key) as {
          data: Category[];
        };

        if (oldUserData) {
          queryClient.cancelQueries(key);
          queryClient.setQueryData(key, () => {
            return {
              data: [...oldUserData.data.filter((item) => item.id !== id)],
            };
          });
        }

        return () => queryClient.setQueryData(key, oldUserData);
      },
      onSettled: () =>
        queryClient.invalidateQueries(
          workspaceQueryKeys.getWorkspaceCategories(workspaceId)
        ),
      onError: (err, variables, rollback) => rollback?.(),
    }
  );

  const { mutate: updateWorkspaceCategoryMutate } = useMutation(
    updateWorkspaceCategoryApi,
    {
      onMutate: (value) => {
        const key = workspaceQueryKeys.getWorkspaceCategories(workspaceId);
        const oldUserData = queryClient.getQueryData(key) as {
          data: Category[];
        };

        if (oldUserData) {
          queryClient.cancelQueries(key);
          queryClient.setQueryData(key, () => {
            return {
              data: [
                ...oldUserData.data.map((item) => {
                  if (item.id === id) {
                    return {
                      ...item,
                      name: value.name,
                      parentFolderId: value.parentFolderId,
                    };
                  }
                  return item;
                }),
              ],
            };
          });
        }

        return () => queryClient.setQueryData(key, oldUserData);
      },
      onSettled: () =>
        queryClient.invalidateQueries(
          workspaceQueryKeys.getWorkspaceCategories(workspaceId)
        ),
      onError: (err, variables, rollback) => rollback?.(),
    }
  );

  const { mutate: createWorkspaceCategoryMutate } = useMutation(
    createWorkspaceCategoryApi,
    {
      onMutate: (value) => {
        const key = workspaceQueryKeys.getWorkspaceCategories(workspaceId);
        const oldUserData = queryClient.getQueryData(key) as {
          data: Category[];
        };

        if (oldUserData) {
          queryClient.cancelQueries(key);
          queryClient.setQueryData(key, () => {
            return {
              data: [
                ...oldUserData.data,
                {
                  name: value.name,
                  parentFolderId: value.parentFolderId,
                  id: uuidv4(),
                },
              ],
            };
          });
        }

        return () => queryClient.setQueryData(key, oldUserData);
      },
      // onSettled: () =>
      //   queryClient.invalidateQueries(
      //     workspaceQueryKeys.getWorkspaceCategories(workspaceId)
      //   ),
      // onError: (err, variables, rollback) => rollback?.(),
    }
  );

  const onCreate = () => {
    createWorkspaceCategoryMutate({
      name: "",
      workspaceId,
      parentFolderId: id,
    });
  };

  return (
    <>
      <Flex direction="row" gap={8} align="center">
        {isEdit ? (
          <Input
            placeholder="Untitled"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            size="small"
            autoFocus
            defaultValue={name}
            onBlur={onChangeTitle}
          />
        ) : (
          <Text onClick={() => setIsEdit(true)}>{name || "Untitled"}</Text>
        )}

        <Flex>
          <Button
            onClick={onCreate}
            size="xsmall"
            variant="quiet"
            iconOnly={
              <Icon size={18}>
                <BiPlus />
              </Icon>
            }
          />
          <Dropdown
            trigger={
              <Button
                size="xsmall"
                variant="quiet"
                iconOnly={
                  <Icon size={18}>
                    <BiDotsHorizontalRounded />
                  </Icon>
                }
              />
            }
            render={({ hide }) => (
              <Dropdown.Menu position="right" style={{ zIndex: 1 }}>
                <Dropdown.Item>이름 변경</Dropdown.Item>
                <Dropdown.Item danger>폴더 삭제</Dropdown.Item>
              </Dropdown.Menu>
            )}
          />
        </Flex>
      </Flex>
      <div style={{ marginLeft: 20 }}>
        {children.map((item: Category) => (
          <CategoryItem {...item} data={data}></CategoryItem>
        ))}
      </div>
    </>
  );
};

export default Categories;

const Container = styled(Flex)`
  height: calc(100vh - 55px);
`;

const ContentContainer = styled(Flex)`
  margin: 0 auto;
  max-width: 800px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 24px;
`;