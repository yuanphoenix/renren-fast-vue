<template>
  <div>
    <el-switch v-model="draggable" active-text="开启拖拽" inactive-text="关闭拖拽"></el-switch>
    <el-button type="danger" @click="batch_delete()" round>批量删除</el-button>
    <el-tree :data="menus" :props="defaultProps" show-checkbox node-key="catId" default-expand-all ref="tree"
             :draggable="draggable" :expand-on-click-node="false" :allow-drop="allowDrop" @node-drop="handleDrop">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span>
                    <el-button type="text" size="mini" @click="() => append(data)">
                        添加
                    </el-button>
                    <el-button type="text" size="mini" @click="() => edit(data)">
                        修改
                    </el-button>
                    <el-button v-if="data.leaf" type="text" size="mini"
                               @click="() => remove(node, data)">
                        删除
                    </el-button>
                </span>
            </span>
    </el-tree>
  </div>
</template>

<script>

export default {
  data () {
    return {
      draggable: false,
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created () {
    this.getMenus()
  },
  methods: {
    handleNodeClick (data) {
      console.log(data)
    },

    batch_delete () {
      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/batchDelete', 'gateway'),
        method: 'post',
        data: this.$http.adornData(this.$refs.tree.getCheckedNodes(), false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getMenus()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })

    },

    edit (data) {
      const labelName = prompt('请输入节点名称:', '')
      if (labelName === null || !labelName) return // 用户点击了取消
      data.name = labelName

      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/update', 'gateway'),
        method: 'post',
        data: this.$http.adornData(data, false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getMenus()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })
    },

    append (data) {
      const labelName = prompt('请输入节点名称:', '')
      if (labelName === null || !labelName) return // 用户点击了取消

      const newChild = {
        name: labelName || '未命名节点',  // 处理空输入
        parentCid: data.catId
      }

      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/save', 'gateway'),
        method: 'post',
        data: this.$http.adornData(newChild, false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getMenus()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })
    },

    handleDrop (draggingNode, dropNode, dropType, ev) {
      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/sort', 'gateway'),
        method: 'post',
        data: this.$http.adornData({
          draggingNodeId: draggingNode.data.catId,
          dropNodeId: dropNode.data.catId,
          dropType: dropType
        }, false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '菜单拖拽成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getMenus()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })
    },

    allowDrop (draggingNode, dropNode, type) {
      return true
    },
    remove (node, data) {
      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/delete', 'gateway'),
        method: 'post',
        data: this.$http.adornData(data, false)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getMenus()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })
    },

    getMenus () {
      this.$http({
        url: this.$http.gulimalladornUrl('/product/category/list/tree', 'gateway'),
        method: 'get',
      }).then(({data}) => {
        this.menus = data.data
      })
    }
  }
}

</script>
<style lang='scss' scoped>
//@import url(); 引入公共 css 类</style>
