<template>

  <el-upload class="upload-demo" action="#" list-type="picture" :http-request="customUpload"
             :on-preview="handlePreview" :before-upload="beforeUpload" :on-remove="handleRemove"
             :before-remove="beforeRemove" :multiple="false" :limit="1" :on-exceed="handleExceed"
             :file-list="fileList">
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
  </el-upload>

</template>
<script>


export default {
  data () {
    return {
      fileList: []
    }
  },
  methods: {
    customUpload (file) {
      const uploadHost = 'https://gulimall--tifa.oss-cn-beijing.aliyuncs.com'
      this.$http({
        url: this.$http.gulimalladornUrl('/oss/get_post_signature_for_oss_upload', 'gateway'),
        method: 'get'
      }).then(({data}) => {
        const objectKey = `${data.dir}${data.key}${file.file.name}`

        let formData = new FormData()
        formData.append('success_action_status', '200')
        formData.append('policy', data.policy)
        formData.append('x-oss-signature', data.signature)
        formData.append('x-oss-signature-version', 'OSS4-HMAC-SHA256')
        formData.append('x-oss-credential', data.x_oss_credential)
        formData.append('x-oss-date', data.x_oss_date)
        formData.append('key', objectKey) // 文件名
        formData.append('x-oss-security-token', data.security_token)
        formData.append('file', file.file) // file 必须为最后一个表单域

        fetch('https://gulimall--tifa.oss-cn-beijing.aliyuncs.com', {
          method: 'POST',
          body: formData
        }).then((response) => {
          console.log(response)
          if (response.status === 200) {
            this.$message({
              message: '上传成功',
              type: 'success',
              duration: 1500,
            })
          } else {
            this.$message.error('上传失败')
          }
        })
      })
    },

    beforeUpload (file) {
      console.log(file)
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      console.log(file)
    },
    handleExceed (files, fileList) {
      this.$message.warning(
          `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length
          + fileList.length} 个文件`)
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    }
  }
}
</script>
<style scoped>

</style>
